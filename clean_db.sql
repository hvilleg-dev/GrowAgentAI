-- Clean all data from database
DELETE FROM "AlertaCrisis";
DELETE FROM "Mensaje";
DELETE FROM "Sesion";
DELETE FROM "Goal";
DELETE FROM "Incrustacion";
DELETE FROM "CostePorProveedor";
DELETE FROM "Usuario";
DELETE FROM "ConfiguracionSistema";

SELECT COUNT(*) as remaining_records FROM "Usuario";
