import { Ejemplar } from "./ejemplar";
import { Prestamo } from "./prestamo";

export class DetallePrestamo {
    id_detprestamo?: number;
    prestamo?: Prestamo;
    ejemplar: Ejemplar;
}
