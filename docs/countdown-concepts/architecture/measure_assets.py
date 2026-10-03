"""Read-only GLB/texture measurements for the seven authored art candidates.

This is an offline documentation helper, not a site build or runtime dependency.
Run from any directory with ordinary Python 3. It writes only the budget report.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import struct

REPO = Path(__file__).resolve().parents[3]
ASSETS = REPO / 'countdowns/assets/concepts'
CONCEPTS = ('tomorrows-roadworks', 'bubblegum-time', 'after-the-flame',
            'low-tide-later', 'not-yet-ripe', 'still-drawing-tomorrow',
            'held-in-suspense')


def dimensions(blob):
    if blob.startswith(b'\x89PNG\r\n\x1a\n'):
        return list(struct.unpack_from('>II', blob, 16))
    if blob.startswith(b'\xff\xd8'):
        cursor = 2
        while cursor < len(blob) - 4:
            if blob[cursor] != 255:
                cursor += 1
                continue
            marker = blob[cursor + 1]
            cursor += 2
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            size = struct.unpack_from('>H', blob, cursor)[0]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                          0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                height, width = struct.unpack_from('>HH', blob, cursor + 3)
                return [width, height]
            cursor += size
    return None


def measure(path):
    blob = path.read_bytes()
    magic, version, size = struct.unpack_from('<III', blob)
    assert magic == 0x46546C67 and version == 2 and size == len(blob), path
    chunks, cursor = {}, 12
    while cursor < size:
        length, kind = struct.unpack_from('<II', blob, cursor)
        chunks[kind] = blob[cursor + 8:cursor + 8 + length]
        cursor += 8 + length
    data = json.loads(chunks[0x4E4F534A])
    binary = chunks.get(0x004E4942, b'')
    accessors = data.get('accessors', [])
    primitives = [p for mesh in data.get('meshes', []) for p in mesh['primitives']]
    textures = []
    for index, image in enumerate(data.get('images', [])):
        if 'bufferView' in image:
            view = data['bufferViews'][image['bufferView']]
            start = view.get('byteOffset', 0)
            content = binary[start:start + view['byteLength']]
        elif image.get('uri') and not image['uri'].startswith('data:'):
            content = (path.parent / image['uri']).read_bytes()
        else:
            content = b''
        wh = dimensions(content)
        textures.append({'index': index, 'name': image.get('name'),
                         'mimeType': image.get('mimeType'),
                         'encodedBytes': len(content), 'dimensions': wh,
                         'decodedRGBA8Bytes': wh[0] * wh[1] * 4 if wh else None})
    absent = {key: sum(key not in p['attributes'] for p in primitives)
              for key in ('NORMAL', 'TEXCOORD_0', 'TANGENT')}
    return {
        'file': str(path.relative_to(REPO)), 'transferBytes': len(blob),
        'sha256': hashlib.sha256(blob).hexdigest(),
        'trianglesPerExportedPrimitive': sum(
            (accessors[p['indices']]['count'] if 'indices' in p else
             accessors[p['attributes']['POSITION']]['count']) // 3
            for p in primitives if p.get('mode', 4) == 4),
        'primitives': len(primitives), 'nodes': len(data.get('nodes', [])),
        'morphPrimitives': sum(bool(p.get('targets')) for p in primitives),
        'extensionsRequired': data.get('extensionsRequired', []),
        'missingPrimitiveAttributes': absent, 'embeddedImages': textures,
        'decodedEmbeddedRGBA8Bytes': (sum(t['decodedRGBA8Bytes'] for t in textures)
            if all(t['decodedRGBA8Bytes'] is not None for t in textures) else None),
    }


report = {
    'measuredAtUTC': datetime.now(timezone.utc).isoformat(),
    'status': 'Measured candidate assets; independent browser/art acceptance is separate.',
    'method': 'Static GLB headers, actual accessors, embedded image dimensions and SHA-256.',
    'limits': [
        'Triangles sum each exported primitive once; runtime clones/instances can change drawn geometry.',
        'RGBA8 is base-level decoded image storage; mipmaps, renderer targets and geometry/GPU memory are excluded.',
        'External live ink, screenshots, font atlases, water/reflection targets and other runtime textures are excluded from the embedded-image figure.',
        'Byte/triangle counts do not establish frame rate, touch reach, visual fidelity or acceptance.',
        'A hash identifies this exact snapshot; rerun after any asset export.'
    ],
    'concepts': {}
}
for concept in CONCEPTS:
    scene = ASSETS / concept / 'scene'
    report['concepts'][concept] = {
        'bundles': [measure(path) for path in sorted(scene.glob('scene*.glb'))],
        'editableSources': [str(p.relative_to(REPO)) for p in
                            sorted((scene / 'authoring').glob('*.blend'))],
        'authoringScripts': [str(p.relative_to(REPO)) for p in
                            sorted((scene / 'authoring').glob('*.py'))],
        'fontNotices': [str(p.relative_to(REPO)) for p in
                        sorted(scene.glob('typography/*OFL*.txt'))]
    }
output = Path(__file__).with_name('asset-budgets.json')
output.write_text(json.dumps(report, indent=2) + '\n')
index = ASSETS / 'README.md'
if index.exists():
    text = index.read_text()
    start, end = '<!-- asset-budgets:start -->', '<!-- asset-budgets:end -->'
    if start in text and end in text:
        names = {'tomorrows-roadworks': 'Roadworks', 'bubblegum-time': 'Bubblegum',
                 'after-the-flame': 'Wax', 'low-tide-later': 'Low Tide',
                 'not-yet-ripe': 'Fruit', 'still-drawing-tomorrow': 'Drawing',
                 'held-in-suspense': 'Metal'}
        lines = ['| Candidate | Export | File MB | Exported triangles | Embedded RGBA8 MiB |',
                 '| --- | --- | ---: | ---: | ---: |']
        for concept, item in report['concepts'].items():
            for bundle in item['bundles']:
                file = Path(bundle['file']).name
                view = 'Portrait' if '-mobile' in file else (
                    'Desktop' if len(item['bundles']) > 1 else 'Shared')
                decoded = bundle['decodedEmbeddedRGBA8Bytes']
                memory = f'{decoded / 1048576:.2f}' if decoded is not None else 'Unknown'
                lines.append(f"| {names[concept]} | {view} | {bundle['transferBytes'] / 1000000:.2f} | {bundle['trianglesPerExportedPrimitive']:,} | {memory} |")
        block = '\n\n'.join([f"Measured {report['measuredAtUTC'][:10]} UTC; exact hashes are in the report.", '\n'.join(lines)])
        before = text.split(start, 1)[0]
        after = text.split(end, 1)[1]
        index.write_text(before + start + '\n\n' + block + '\n\n' + end + after)
for concept, item in report['concepts'].items():
    for bundle in item['bundles']:
        print(concept, Path(bundle['file']).name,
              bundle['transferBytes'], bundle['trianglesPerExportedPrimitive'],
              bundle['decodedEmbeddedRGBA8Bytes'], bundle['missingPrimitiveAttributes'])
