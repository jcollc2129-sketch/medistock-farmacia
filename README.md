# MediStock Farmacia

PWA offline para control de entradas y salidas de medicamentos.

## Flujo de trabajo (oficial)

**Solo GitHub → Cloudflare Pages**

1. Cambios se suben al repo: `jcollc2129-sketch/medistock-farmacia` (branch `main`)
2. Cloudflare Pages, conectado a ese repo, despliega solo
3. **Netlify no se usa** para nuevas actualizaciones

## URL de produccion
https://medistock-f1a.pages.dev/

## Acceso demo
- admin / admin123
- operario / operario123

## Version actual (v11)
- Cargo vs No cargo (menu inferior)
- Catalogos de dotacion (cargo) y no cargo
- Motivos de salida: Uso / Caducado
- Destinos: Consulta, carros, quirofanos, SVA, UCI
- Auditoria: quien retira, fecha, hora, motivo, destino

## Como publicar un cambio
1. Actualizar archivos en GitHub (`main`)
2. Cloudflare Pages hace deploy automatico
3. En el movil: recargar la PWA (o borrar cache del sitio)

## Build (Cloudflare Pages)
- Framework: None
- Build command: (vacio)
- Output directory: `/` o `.`
- Production branch: `main`
