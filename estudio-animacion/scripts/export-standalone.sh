#!/usr/bin/env bash
# Separación SEGURA del estudio en su propio repositorio.
#
# El estudio vive hoy en la carpeta estudio-animacion/ del repositorio pos-android.
# Este script NO modifica pos-android: trabaja sobre un clon temporal, extrae
# sólo el historial de estudio-animacion/ (git subtree split) y deja un repositorio
# nuevo listo para subir a un remoto vacío. No borra ni reescribe nada del original.
#
# Uso:
#   scripts/export-standalone.sh <ruta-del-repo-pos-android> <rama> <carpeta-destino>
#   cd <carpeta-destino> && git remote add origin <URL-de-tu-repo-nuevo> && git push -u origin main
set -euo pipefail
SRC="${1:?ruta del repositorio pos-android}"
BRANCH="${2:?rama que contiene estudio-animacion}"
DEST="${3:?carpeta de destino (no debe existir)}"
[ -e "$DEST" ] && { echo "El destino $DEST ya existe"; exit 1; }
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone --quiet --no-local --branch "$BRANCH" "$SRC" "$TMP/clone"
cd "$TMP/clone"
git subtree split --quiet --prefix=estudio-animacion -b estudio-standalone
git init --quiet -b main "$DEST"
git -C "$DEST" pull --quiet "$TMP/clone" estudio-standalone
echo "✔ Repositorio independiente en $DEST ($(git -C "$DEST" rev-list --count HEAD) commits, sólo estudio-animacion)"
