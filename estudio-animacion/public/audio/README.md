# Pistas de audio (no incluidas)

Este proyecto **no contiene audio generado**. El sistema está preparado para
importar archivos reales; cada pista sólo se monta si se indica su ruta.

Coloca los archivos aquí, por ejemplo:

```
public/audio/ep01/narracion.mp3     # locución en español latinoamericano
public/audio/ep01/musica.mp3        # música cinematográfica original/licenciada
public/audio/ep01/ambiente.mp3      # ambiente submarino
public/audio/ep01/movimiento.mp3    # efectos de movimiento
public/audio/ep01/tension.mp3       # efectos de tensión
public/audio/ep01/transiciones.mp3  # whooshes / golpes de título
```

Y pásalos como props al renderizar:

```bash
npx remotion render src/index.ts Ep01Demo out/ep01-demo.mp4 --props='{
  "quality":"final","showSubtitles":true,
  "audio":{
    "narration":{"src":"audio/ep01/narracion.mp3","volume":1},
    "music":{"src":"audio/ep01/musica.mp3","volume":0.35},
    "ambience":{"src":"audio/ep01/ambiente.mp3","volume":0.5},
    "transitions":{"src":"audio/ep01/transiciones.mp3","at":12.8,"volume":0.8}
  }}'
```

Si una ruta no existe el render falla: así ningún video sale con pistas vacías por error.
Los momentos sugeridos para efectos están en `src/episodes/ep01-pulpo/script.ts` (campo `sfx`).
