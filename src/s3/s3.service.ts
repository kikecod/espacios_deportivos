import { DeleteObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor(private configService: ConfigService) {

        this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';

        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

        // Configuración base
        const s3Config: S3ClientConfig = {
            region: this.region,
        };

        // SOLO si existen las claves en el .env, las usamos (Modo Local)
        if (accessKeyId && secretAccessKey) {
            s3Config.credentials = {
                accessKeyId,
                secretAccessKey,
            };
        }
        // Si no existen, el S3Client buscará automáticamente el Rol de IAM (Modo EC2)

        this.s3Client = new S3Client(s3Config);
    }

    /**
     * Upload a file to S3
     * @param file - The file to upload
     * @param folder - The folder type ('canchas' or 'sedes')
     * @param entityId - The entity ID
     * @returns The S3 URL of the uploaded file
     */

    async uploadFile(
        file: Express.Multer.File,
        folder: 'canchas' | 'sedes' | 'usuarios' | 'licencias',
        entityId: number
    ): Promise<string> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;

        //4. Crear la key ruta del archivo en s3
        // Ejemplo: "canchas/123/aba-jfdaa.jpg"

        const key = `${folder}/${entityId}/${fileName}`;

        //5. Crear comnando para subir archivo

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        // 6. ejecutar el comando para subir
        await this.s3Client.send(command);

        // 7. retornar la url del archivo

        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    }
    async deleteFile(fileUrl: string): Promise<void> {
        const key = fileUrl.split('.amazonaws.com/')[1];

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        })

        await this.s3Client.send(command);
    }

}


