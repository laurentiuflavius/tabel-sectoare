# Generator tabel sectoare — Acoperișul Speranței

Aplicație web care generează tabelul lunar de sectoare (Word .docx) pe baza persoanelor, sectoarelor și restricțiilor introduse de utilizator. Totul rulează local, în browser — nu se trimite nimic pe internet.

## Funcționalități

- **Persoane**: nume, zi de naștere (persoana e liberă în acea zi), una sau mai multe perioade de absență în lună (ex. plecată 8–14 și 20–22), număr maxim de zile de sector pe lună.
- **Sectoare**: pentru fiecare sector se bifează cine îl poate face. Opțiuni per sector:
  - **Rotație fixă** — sectorul trece pe rând, la interval cât mai egal (ex. Vase la ~6 zile, Verificare animale zilnic prin rotație);
  - **Independent** — nu blochează alt sector în aceeași zi (ex. Verificare animale poate fi combinat cu alt sector);
  - **Interval minim** — zile minime între două zile ale aceleiași persoane la același sector.
- **Restricții selectabile**: zi liberă de ziua de naștere, limite maxime de zile, indisponibilități, interval minim, plus **restricții pe zile ale săptămânii** (ex. sâmbăta anumite persoane pot avea doar anumite sectoare).
- **Reguli permanente**: un sector are o singură persoană pe zi; o persoană are cel mult un sector pe zi (în afara celor independente).
- **Generează tabel**: alege luna și anul, apasă butonul — aplicația calculează repartizarea (mii de încercări, o alege pe cea mai echilibrată), afișează raportul de verificare, previzualizarea și descarcă documentul Word.

Aplicația pornește preconfigurată cu persoanele, sectoarele și restricțiile de la Acoperișul Speranței; totul se poate modifica, iar datele se salvează automat în browserul folosit.

## Rulare locală

Deschide `index.html` direct în browser — nu e nevoie de server sau instalare.

## Publicare pe GitHub (GitHub Pages)

1. Creează un cont pe [github.com](https://github.com) (dacă nu ai deja) și apasă **New repository**. Dă-i un nume, de ex. `tabel-sectoare`, lasă-l **Public** și apasă **Create repository**.
2. Încarcă fișierele proiectului. Cel mai simplu, din pagina repository-ului: **Add file → Upload files**, apoi trage toate fișierele și folderul `lib/` (cu `index.html`, `style.css`, `app.js`, `lib/jszip.min.js`, `README.md`) și apasă **Commit changes**.
   - Alternativ, din linia de comandă:
     ```bash
     git init
     git add index.html style.css app.js lib/jszip.min.js README.md
     git commit -m "Generator tabel sectoare"
     git branch -M main
     git remote add origin https://github.com/NUMELE-TAU/tabel-sectoare.git
     git push -u origin main
     ```
3. Activează GitHub Pages: în repository, **Settings → Pages**, la *Build and deployment* alege **Deploy from a branch**, ramura **main**, folderul **/(root)**, apoi **Save**.
4. După ~1 minut, aplicația va fi disponibilă la `https://NUMELE-TAU.github.io/tabel-sectoare/`.

## Structura proiectului

```
index.html        interfața aplicației
style.css         stilurile
app.js            logica: stare, algoritmul de repartizare, export Word
lib/jszip.min.js  biblioteca de arhivare zip (inclusă local, fără dependențe externe)
```

## Note

- Dacă restricțiile sunt prea strânse (ex. prea puține persoane bifate la un sector), aplicația afișează exact ziua și sectorul fără persoană disponibilă, ca să știi ce să relaxezi.
- Documentul generat are exact structura și formatarea tabelelor lunare existente: A4 vedere, aceleași margini, același tabel cu chenar gros între persoane, două subcoloane pe persoană, font Calibri 16pt, titlul în antetul paginii („… – Luna <Luna> <Anul>", bold, 20pt).
