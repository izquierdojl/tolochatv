# Usuarios y administración

## Cuenta de administrador inicial

El primer usuario creado en `/setup` es administrador automáticamente. La aplicación no permite que el sistema se quede sin ningún administrador: si se elimina o se desactiva el último, otro usuario se conserva o promociona como administrador.

Usa una contraseña larga y no compartas el archivo `server_settings.json`, porque contiene la configuración de usuarios y fuentes.

## Crear usuarios

Un administrador puede abrir **Settings > Users > Add User** y definir:

- Nombre de usuario.
- Contraseña de al menos 8 caracteres.
- Privilegios de administrador, si corresponde.
- Límite de streams por fuente.
- Grupos a los que el usuario no puede acceder.

Los usuarios normales pueden gestionar su propia cuenta y sus preferencias, pero no tienen acceso a la administración del servidor ni a la gestión de otros usuarios.

## Contraseñas

Desde el panel de cada usuario se puede establecer una nueva contraseña. Las contraseñas se guardan como hashes con saltos; TolochaTV no necesita guardar la contraseña en texto plano.

Si un usuario pierde su contraseña y no existe otro administrador, detén la aplicación y restaura una copia de seguridad válida de la configuración de usuarios. No edites hashes a mano.

## Roles y eliminación

Un administrador puede cambiar los privilegios de otros usuarios, eliminar usuarios y administrar sus límites. Un usuario puede solicitar la eliminación de su propia cuenta confirmando su contraseña. La eliminación no debe confundirse con una copia de seguridad: borra la cuenta, pero conserva el resto de la configuración del servidor.

Antes de quitar una cuenta de administrador, comprueba que queda al menos otra cuenta administradora.

## Límites de streams

Los límites se pueden definir por fuente para cada usuario. El valor `0` significa sin límite específico. También existe un límite global en cada fuente, igualmente con `0 = ilimitado`.

Ten en cuenta que la interfaz indica que el límite de usuario puede requerir **Always Transcode**. Si se necesita controlar el número de conexiones, configura el modo de transcodificación y comprueba el resultado con el proveedor y el hardware disponibles.

## Restricciones de grupos

El administrador puede mover grupos entre **Available** y **Unavailable** para cada usuario. Las restricciones se aplican por tipo y fuente:

- Canales en directo: categorías de la fuente.
- Películas: grupos de películas de la fuente.
- Series: grupos de series de la fuente.

Una restricción de grupo evita que ese usuario vea o reproduzca el contenido correspondiente. También se respeta en búsqueda y reproducción directa.
