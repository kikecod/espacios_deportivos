export interface RegistrarDeudaResponse{
    error: boolean;
    mensaje: string;
    url_pasarela_pagos?: string;
    id_transaccion?: string;    
    qr_simple_url?: string;
    
}