import { Autor } from "./autor";

export class Recurso {
    id_recurso?: number;
    titulo: string;
    descripcion: string;
    idioma: string;
    es_referencia: boolean;

    logo?: string;

    autor: Autor | null=null;
}
