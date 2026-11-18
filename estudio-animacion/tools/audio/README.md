# Audio del Episodio 01

Todo el audio de `public/audio/ep01/` se genera con estos scripts. No hay muestras de
terceros, y ninguna pista es un archivo de relleno.

| Pista | Archivo | Origen |
|---|---|---|
| Narración (es-MX) | `narracion.m4a` | `narration.py`: voz neuronal Piper `es_MX-claude-high` (dataset con licencia Apache-2.0, según el MODEL_CARD de la voz) |
| Música ambiental | `musica.m4a` | `score.py`: síntesis original (pads, bajo, arpegios, campanas, reverberación sintética) |
| Sonidos submarinos | `ambiente.m4a` | `score.py`: ruido marrón filtrado + burbujas sintetizadas |
| Movimiento | `movimiento.m4a` | `score.py`: roces, chorros del sifón, tinta, latidos, morena |
| Suspenso | `tension.m4a` | `score.py`: drones, clúster con trémolo, golpes que se aceleran |
| Transiciones | `transiciones.m4a` | `score.py`: barridos en los cortes y golpes de título/final |

## Regenerar

```bash
pip install piper-tts==1.3.0 soundfile numpy scipy

# Voz (≈ 64 MB). Hugging Face puede estar bloqueado: esta copia está en las releases de sherpa-onnx
curl -L -o voz.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_MX-claude-high.tar.bz2
tar -xjf voz.tar.bz2

python3 tools/audio/narration.py --voice vits-piper-es_MX-claude-high/es_MX-claude-high.onnx
python3 tools/audio/score.py
```

`narration.py` lee `src/episodes/ep01-pulpo/narration.json` (texto + instante deseado de
cada frase) y hace lo siguiente:

1. Sintetiza cada frase por separado.
2. Mide su duración real.
3. Si una frase se solaparía con la anterior, la retrasa; si el retraso supera 1 s, falla.
4. Monta la pista de 180 s.
5. Escribe `narration-timing.json`.

El vídeo usa ese archivo para los **subtítulos** y para el **ducking** automático de la música.

Piper introduce algo de variación aleatoria. Por eso, cada vez que se regenera la voz hay que
regenerar también `narration-timing.json` (el script hace las dos cosas a la vez).

## Sustituir por una locución humana

1. Graba cada frase con el `id` de `narration.json`.
2. Mide los tiempos de inicio y fin y escríbelos en `narration-timing.json` (mismo formato).
3. Reemplaza `public/audio/ep01/narracion.m4a`.

Los subtítulos y el ducking se ajustan solos.
