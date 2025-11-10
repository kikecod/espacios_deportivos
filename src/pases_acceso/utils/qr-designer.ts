import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import * as QRCode from 'qrcode';

/**
 * Diseñador de códigos QR estilizados para pases de acceso
 * 
 * Genera QR codes con branding profesional que incluyen:
 * - Logo corporativo
 * - Información de la reserva
 * - Diseño estilizado con colores cyan/purple
 * - Formato optimizado para visualización
 */
export class QRDesigner {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  // Dimensiones del canvas
  private readonly WIDTH = 600;
  private readonly HEIGHT = 900;

  // Distribución de secciones
  private readonly LOGO_HEIGHT = 120;
  private readonly QR_HEIGHT = 350;
  private readonly INFO_HEIGHT = 250;
  private readonly FOOTER_HEIGHT = 60;

  // Paleta de colores (Tailwind-inspired)
  private readonly COLORS = {
    primary: '#0ea5e9', // cyan-500
    primaryLight: '#7dd3fc', // cyan-300
    primaryDark: '#0284c7', // cyan-600
    secondary: '#a855f7', // purple-500
    secondaryLight: '#c084fc', // purple-400
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  };

  constructor() {
    this.canvas = createCanvas(this.WIDTH, this.HEIGHT);
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Genera un QR code estilizado completo
   * @param qrData Datos del pase de acceso para codificar en QR
   * @returns Buffer de la imagen PNG generada
   */
  async generateStyledQR(qrData: {
    codigoQR: string;
    reservaId: number;
    canchaInfo: string;
    fechaHora: string;
    clienteNombre: string;
    cantidadPersonas: number;
    estado: string;
  }): Promise<Buffer> {
    // 1. Limpiar canvas
    this.clearCanvas();

    // 2. Dibujar fondo con gradiente
    await this.drawBackground();

    // 3. Dibujar logo (opcional - si existe el archivo)
    await this.drawLogo();

    // 4. Generar y dibujar código QR
    await this.drawQRCode(qrData.codigoQR);

    // 5. Dibujar información de la reserva
    this.drawReservaInfo(qrData);

    // 6. Dibujar footer con marca de agua
    this.drawFooter();

    // 7. Retornar buffer de imagen
    return this.canvas.toBuffer('image/png');
  }

  /**
   * Limpia el canvas
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  /**
   * Dibuja el fondo con gradiente
   */
  private async drawBackground(): Promise<void> {
    // Gradiente de fondo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
    gradient.addColorStop(0, this.COLORS.gray[50]);
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, this.COLORS.gray[100]);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Borde decorativo superior con gradiente cyan-purple
    const headerGradient = this.ctx.createLinearGradient(0, 0, this.WIDTH, 0);
    headerGradient.addColorStop(0, this.COLORS.primary);
    headerGradient.addColorStop(1, this.COLORS.secondary);

    this.ctx.fillStyle = headerGradient;
    this.ctx.fillRect(0, 0, this.WIDTH, 8);
  }

  /**
   * Dibuja el logo (si existe)
   */
  private async drawLogo(): Promise<void> {
    try {
      // Intentar cargar logo desde assets
      const logoPath = `${__dirname}/../assets/logo.svg`;
      const logo = await loadImage(logoPath);

      // Calcular dimensiones manteniendo aspect ratio
      const maxLogoHeight = 80;
      const maxLogoWidth = 200;
      const aspectRatio = logo.width / logo.height;

      let logoWidth = maxLogoWidth;
      let logoHeight = maxLogoWidth / aspectRatio;

      if (logoHeight > maxLogoHeight) {
        logoHeight = maxLogoHeight;
        logoWidth = maxLogoHeight * aspectRatio;
      }

      // Centrar logo
      const x = (this.WIDTH - logoWidth) / 2;
      const y = 30;

      this.ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    } catch (error) {
      // Si no existe el logo, mostrar diseño con texto estilizado
      const centerX = this.WIDTH / 2;
      const centerY = 70;

      // Fondo decorativo para el título
      const titleWidth = 400;
      const titleHeight = 60;
      const titleX = (this.WIDTH - titleWidth) / 2;
      const titleY = centerY - 30;

      // Gradiente de fondo para el título
      const titleGradient = this.ctx.createLinearGradient(titleX, titleY, titleX + titleWidth, titleY + titleHeight);
      titleGradient.addColorStop(0, 'rgba(14, 165, 233, 0.05)');
      titleGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      titleGradient.addColorStop(1, 'rgba(14, 165, 233, 0.05)');

      this.ctx.fillStyle = titleGradient;
      this.roundRect(titleX, titleY, titleWidth, titleHeight, 10);
      this.ctx.fill();

      // Texto principal
      this.ctx.font = 'bold 32px Arial, sans-serif';
      
      // Crear gradiente para el texto
      const textGradient = this.ctx.createLinearGradient(centerX - 150, 0, centerX + 150, 0);
      textGradient.addColorStop(0, this.COLORS.primary);
      textGradient.addColorStop(1, this.COLORS.secondary);
      
      this.ctx.fillStyle = textGradient;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('PASE DE ACCESO', centerX, centerY);

      // Subtítulo
      this.ctx.font = '14px Arial, sans-serif';
      this.ctx.fillStyle = this.COLORS.gray[600];
      this.ctx.fillText('Sistema de Gestión Deportiva', centerX, centerY + 25);
    }
  }

  /**
   * Genera y dibuja el código QR
   * @param codigoQR UUID del pase
   */
  private async drawQRCode(codigoQR: string): Promise<void> {
    // Generar QR code como data URL
    const qrDataUrl = await QRCode.toDataURL(codigoQR, {
      width: 300,
      margin: 2,
      color: {
        dark: this.COLORS.gray[900],
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // Cargar imagen del QR
    const qrImage = await loadImage(qrDataUrl);

    // Calcular posición centrada
    const qrSize = 300;
    const x = (this.WIDTH - qrSize) / 2;
    const y = this.LOGO_HEIGHT + 40;

    // Dibujar fondo blanco con borde
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;
    this.roundRect(x - 15, y - 15, qrSize + 30, qrSize + 30, 12);
    this.ctx.fill();

    // Resetear sombra
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    // Dibujar QR
    this.ctx.drawImage(qrImage, x, y, qrSize, qrSize);

    // Borde con gradiente
    const borderGradient = this.ctx.createLinearGradient(x - 15, y - 15, x + qrSize + 15, y + qrSize + 15);
    borderGradient.addColorStop(0, this.COLORS.primary);
    borderGradient.addColorStop(1, this.COLORS.secondary);

    this.ctx.strokeStyle = borderGradient;
    this.ctx.lineWidth = 3;
    this.roundRect(x - 15, y - 15, qrSize + 30, qrSize + 30, 12);
    this.ctx.stroke();
  }

  /**
   * Dibuja la información de la reserva
   */
  private drawReservaInfo(qrData: {
    reservaId: number;
    canchaInfo: string;
    fechaHora: string;
    clienteNombre: string;
    cantidadPersonas: number;
    estado: string;
  }): void {
    const startY = this.LOGO_HEIGHT + this.QR_HEIGHT + 60;
    let currentY = startY;

    // Título de sección
    this.ctx.font = 'bold 24px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.gray[800];
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DETALLES DE LA RESERVA', this.WIDTH / 2, currentY);

    currentY += 40;

    // Línea separadora
    const lineGradient = this.ctx.createLinearGradient(100, currentY, this.WIDTH - 100, currentY);
    lineGradient.addColorStop(0, 'rgba(14, 165, 233, 0)');
    lineGradient.addColorStop(0.5, this.COLORS.primary);
    lineGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(100, currentY);
    this.ctx.lineTo(this.WIDTH - 100, currentY);
    this.ctx.stroke();

    currentY += 40;

    // Información en una sola columna, más espaciado
    this.ctx.textAlign = 'left';
    const leftX = 80;
    const lineHeight = 40;

    // Todos los campos en una columna
    this.drawInfoField('Reserva:', `#${qrData.reservaId}`, leftX, currentY);
    currentY += lineHeight;
    
    this.drawInfoField('Fecha/Hora:', qrData.fechaHora, leftX, currentY);
    currentY += lineHeight;
    
    this.drawInfoField('Cancha:', qrData.canchaInfo, leftX, currentY);
    currentY += lineHeight;
    
    this.drawInfoField('Cliente:', qrData.clienteNombre, leftX, currentY);
    currentY += lineHeight;
    
    this.drawInfoField('Personas:', qrData.cantidadPersonas.toString(), leftX, currentY);
    currentY += lineHeight;

    // Estado con badge de color
    this.drawStatusBadge(qrData.estado, leftX, currentY);
  }

  /**
   * Dibuja un campo de información
   */
  private drawInfoField(label: string, value: string, x: number, y: number): void {
    // Label con ancho fijo más amplio
    this.ctx.font = 'bold 16px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.gray[700];
    this.ctx.fillText(label, x, y);

    // Value - ajustar posición según el label más largo
    this.ctx.font = '16px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.gray[900];
    // Aumentar espacio para evitar sobreescritura
    this.ctx.fillText(value, x + 130, y);
  }

  /**
   * Dibuja un badge de estado
   */
  private drawStatusBadge(estado: string, x: number, y: number): void {
    // Determinar color según estado
    let bgColor: string;
    let textColor = '#ffffff';

    switch (estado.toLowerCase()) {
      case 'activo':
        bgColor = '#10b981'; // green-500
        break;
      case 'pendiente':
        bgColor = '#f59e0b'; // amber-500
        break;
      case 'usado':
        bgColor = '#6b7280'; // gray-500
        break;
      case 'expirado':
        bgColor = '#ef4444'; // red-500
        break;
      case 'cancelado':
        bgColor = '#dc2626'; // red-600
        break;
      default:
        bgColor = this.COLORS.primary;
    }

    // Dibujar label
    this.ctx.font = 'bold 16px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.gray[700];
    this.ctx.fillText('Estado:', x, y);

    // Dibujar badge
    const badgeX = x + 130; // Consistente con drawInfoField
    const badgeY = y - 14;
    const badgeWidth = 120;
    const badgeHeight = 28;

    this.ctx.fillStyle = bgColor;
    this.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
    this.ctx.fill();

    // Texto del badge
    this.ctx.font = 'bold 14px Arial, sans-serif';
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(estado.toUpperCase(), badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

    // Resetear alineación
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
  }

  /**
   * Dibuja el footer con instrucciones
   */
  private drawFooter(): void {
    const y = this.HEIGHT - this.FOOTER_HEIGHT;

    // Fondo del footer
    this.ctx.fillStyle = this.COLORS.gray[100];
    this.ctx.fillRect(0, y, this.WIDTH, this.FOOTER_HEIGHT);

    // Texto de instrucciones
    this.ctx.font = '14px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.gray[700];
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const centerY = y + this.FOOTER_HEIGHT / 2;
    this.ctx.fillText('Presente este código al ingresar a la instalación', this.WIDTH / 2, centerY - 8);

    this.ctx.font = 'bold 12px Arial, sans-serif';
    this.ctx.fillStyle = this.COLORS.primary;
    this.ctx.fillText('Sistema de Gestión de Reservas Deportivas', this.WIDTH / 2, centerY + 10);
  }

  /**
   * Helper para dibujar rectángulos con bordes redondeados
   */
  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}
