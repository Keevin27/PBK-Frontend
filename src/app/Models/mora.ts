import { Prestamo } from "./prestamo";
import { Tarifa } from "./tarifa";
import { Transaccion } from "./transaccion";

export class Mora extends Transaccion{
    monto_aplicado: number;
    tarifa: Tarifa;
    prestamo: Prestamo;
}
