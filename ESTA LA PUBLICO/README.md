# 🚀 CriptoLive - Plataforma de Criptomonedas

CriptoLive es una plataforma moderna y completa para el trading de criptomonedas, que ofrece información en tiempo real, simulación de inversiones, gestión de portfolio y exchange integrado.

## ✨ Características

### 📊 Dashboard en Tiempo Real
- Precios actualizados de las principales criptomonedas
- Estadísticas del mercado global (capitalización, volumen, dominancia BTC)
- Gráficos interactivos con Chart.js
- Datos en vivo a través de la API de CoinGecko

### 💱 Exchange
- **Compra y venta** de criptomonedas
- Cálculo automático de cantidades
- Historial de transacciones
- Balance de usuario con persistencia local

### 💼 Portfolio Dinámico
- Visualización de todas tus inversiones
- Cálculo de ganancias/pérdidas en tiempo real
- ROI (Retorno de inversión) automático
- Gráfico de distribución de activos

### 🎯 Simulador de Inversiones
- Simula inversiones históricas
- Calcula ROI de diferentes períodos
- Recomendaciones basadas en rendimiento
- Gráficos de evolución

### 🎨 Diseño Premium
- Glassmorphism y gradientes vibrantes
- Animaciones suaves y micro-interacciones
- Responsive design (mobile, tablet, desktop)
- Dark mode optimizado

### 🔐 Autenticación
- Sistema de login (preparado para Google OAuth)
- Persistencia de datos en localStorage
- Gestión de sesiones

## 🛠️ Stack Tecnológico

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con variables CSS, gradientes y glassmorphism
- **JavaScript (Vanilla)** - Arquitectura modular y orientada a objetos
- **Chart.js** - Gráficos interactivos
- **CoinGecko API** - Datos de criptomonedas en tiempo real
- **Google OAuth** - Autenticación (configuración requerida)

## 🚀 Instalación y Uso

### Opción 1: Abrir directamente en el navegador

Simplemente abre el archivo `index.html` en tu navegador favorito.

### Opción 2: Servidor local (recomendado)

#### Con Python:
```bash
# Navegar al directorio del proyecto
cd criptolive

# Python 3
python -m http.server 8000

# O usando npm
npm start
```

Luego abre tu navegador en: `http://localhost:8000`

#### Con Node.js:
```bash
# Instalar servidor simple
npm install -g http-server

# Ejecutar servidor
http-server -p 8000
```

## ⚙️ Configuración de Google OAuth (Opcional)

Para habilitar el login con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sign-In
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:8000` a los orígenes autorizados
6. Copia el Client ID
7. En `index.html`, reemplaza `YOUR_GOOGLE_CLIENT_ID` con tu Client ID real:
   ```html
   <div id="g_id_onload" data-client_id="TU_CLIENT_ID_AQUI" ...>
   ```

## 📖 Guía de Uso

### 1. Dashboard
- Visualiza los precios actuales de las 12 principales criptomonedas
- Consulta estadísticas del mercado en tiempo real
- Explora gráficos de precios históricos

### 2. Exchange
- **Comprar**: Selecciona una criptomoneda, ingresa el monto en USD y confirma
- **Vender**: Elige una cripto de tu portfolio, indica la cantidad y vende
- Revisa tu historial de transacciones

### 3. Portfolio
- Visualiza todas tus inversiones
- Consulta ganancias/pérdidas actuales
- Analiza la distribución de tus activos con el gráfico circular

### 4. Simulador
- Selecciona una criptomoneda
- Ingresa el monto hipotético de inversión
- Elige el período de tiempo
- Ejecuta la simulación para ver resultados y recomendaciones

## 💾 Almacenamiento de Datos

Todos los datos se almacenan localmente en tu navegador usando `localStorage`:
- Balance de usuario
- Portfolio de criptomonedas
- Historial de transacciones
- Sesión de usuario

**Nota**: Si limpias los datos del navegador, perderás tu información.

## 🌐 API Externa

Esta aplicación utiliza la [CoinGecko API](https://www.coingecko.com/api/documentation) (versión gratuita) para obtener:
- Precios en tiempo real
- Datos de mercado
- Información histórica
- Imágenes de criptomonedas

**Límites**: La API gratuita tiene límites de tasa. Los datos se actualizan cada 60 segundos.

## 🔒 Seguridad y Disclaimers

⚠️ **IMPORTANTE**:
- Esta es una aplicación **educativa y de demostración**
- **NO** utiliza dinero real
- **NO** realiza transacciones reales
- Los datos son simulados y se almacenan localmente
- **NO** es asesoramiento financiero

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #ec4899;
    /* ... más variables */
}
```

### Cambiar criptomonedas mostradas
Modifica en `app.js`:
```javascript
const CONFIG = {
    TOP_CRYPTOS_COUNT: 12, // Cambia este número
    // ...
};
```

### Cambiar intervalo de actualización
```javascript
const CONFIG = {
    UPDATE_INTERVAL: 60000, // En milisegundos (60000 = 1 minuto)
    // ...
};
```

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Mejorar el código
- Mejorar la documentación

## 📄 Licencia

MIT License - Libre para usar, modificar y distribuir.

## 🙏 Agradecimientos

- [CoinGecko](https://www.coingecko.com/) por su excelente API gratuita
- [Chart.js](https://www.chartjs.org/) por los gráficos
- [Google Fonts](https://fonts.google.com/) por la tipografía Inter

---

**Desarrollado con ❤️ usando tecnologías web modernas**

¿Preguntas? ¿Sugerencias? ¡Abre un issue!
