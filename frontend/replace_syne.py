from pathlib import Path
root = Path(r"c:/Users/Randel/Downloads/Von Files/Von_Thesis/Von_Thesis/frontend")
for p in root.rglob('*.jsx'):
    text = p.read_text(encoding='utf-8')
    updated = text.replace("'Syne',sans-serif", "'Montserrat',sans-serif")
    updated = updated.replace('family=Syne:wght@400;600;700;800', 'family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;700&display=swap')
    if updated != text:
        p.write_text(updated, encoding='utf-8')
        print('updated', p)
