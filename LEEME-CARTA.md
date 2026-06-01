# Cómo actualizar la carta y los precios

La carta del sitio (la sección **"Todo lo que sale del garage"**) sale toda de **un solo
archivo**: `assets/data/menu.json`. Cambiás ahí y se actualiza en la web. No hay que
tocar nada más.

> Ya no usamos buenacarta.com. La carta vive dentro de la propia web.

---

## Cambiar un precio en 3 pasos

1. **Abrí** el archivo `assets/data/menu.json` (con el Bloc de notas, VS Code, o el
   editor de archivos de Netlify).
2. **Buscá el plato** y cambiá lo que está entre comillas después de `"price"`.
   Por ejemplo, para subir el Brisket de $40.000 a $42.000:

   ```json
   { "name": "Brisket", "desc": "12 hs de quebracho", "price": "$40.000" }
   ```
   queda

   ```json
   { "name": "Brisket", "desc": "12 hs de quebracho", "price": "$42.000" }
   ```

3. **Guardá** y **subí el cambio a Netlify** (ver abajo "Publicar el cambio").
   En 1–2 minutos la web muestra el precio nuevo.

Tan simple como eso. Escribí el precio igual que aparece en la web, con el `$` y el
punto de los miles (`$42.000`). Lo que pongas entre las comillas es exactamente lo que
se ve.

---

## Otras cosas que podés cambiar en el mismo archivo

- **El nombre o la descripción de un plato:** cambiá el texto de `"name"` o `"desc"`.
  Si un plato no tiene descripción, dejá `"desc": ""` (comillas vacías).
- **Agregar un plato nuevo:** copiá una línea entera de un plato (la que empieza con `{`
  y termina con `}`), pegala justo debajo dentro de la misma categoría, y cambiale el
  nombre, la descripción y el precio. **Importante:** cada plato tiene que terminar con
  una coma `,` **menos el último** de la lista.
- **Borrar un plato:** borrá la línea entera de ese plato. Acordate de la regla de la
  coma: el último plato de cada categoría no lleva coma al final.

### Ejemplo de una categoría completa

```json
{
  "id": "postres",
  "name": "Postres",
  "items": [
    { "name": "Tiramisú", "desc": "", "price": "$20.000" },
    { "name": "Flan tradicional", "desc": "", "price": "$9.500" }
  ]
}
```

Los nombres entre comillas (`"id"`, `"name"`, `"items"`, `"desc"`, `"price"`) **no se
tocan**: son las etiquetas que la web entiende. Vos solo cambiás los textos del lado
derecho.

---

## Publicar el cambio (que se vea en la web real)

Depende de cómo esté publicado el sitio:

- **Si está conectado a GitHub + Netlify (recomendado):** subí el cambio a GitHub
  (o editá el archivo directo en GitHub) y Netlify lo publica solo en 1–2 minutos.
- **Si subís a mano a Netlify:** entrá a tu sitio en [app.netlify.com](https://app.netlify.com),
  andá a **Deploys → Drag and drop**, y arrastrá la carpeta entera del proyecto otra vez.

---

## Si algo se rompe

El error más común es una **coma de más o de menos**, o unas **comillas sin cerrar**.
Si la carta deja de cargar:

1. Revisá que cada plato termine con `,` **menos el último** de su categoría.
2. Revisá que cada `"texto"` tenga sus dos comillas.
3. Pegá el contenido del archivo en [jsonlint.com](https://jsonlint.com) y apretá
   "Validate": te marca en qué línea está el problema.

Ante la duda, deshacé el último cambio y volvé a guardar. El archivo anterior siempre
funciona.
