<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Zone;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'Ahuachapán' => [
                'Atiquizaya', 'El Refugio', 'San Lorenzo', 'Turín',
                'Ahuachapán', 'Apaneca', 'Concepción de Ataco', 'Tacuba',
                'Guaymango', 'Jujutla', 'San Francisco Menéndez',
                'San Pedro Puxtla',
            ],

            'Santa Ana' => [
                'Masahuat', 'Metapán', 'Santa Rosa Guachipilín',
                'Texistepeque', 'Santa Ana', 'Coatepeque', 'El Congo',
                'Candelaria de la Frontera', 'Chalchuapa', 'El Porvenir',
                'San Antonio Pajonal', 'San Sebastián Salitrillo',
                'Santiago de la Frontera',
            ],

            'Sonsonate' => [
                'Juayúa', 'Nahuizalco', 'Salcoatitán',
                'Santa Catarina Masahuat', 'Nahulingo',
                'San Antonio del Monte', 'Santo Domingo de Guzmán',
                'Sonsonate', 'Sonzacate', 'Armenia', 'Caluco',
                'Cuisnahuat', 'Izalco', 'San Julián',
                'Santa Isabel Ishuatán', 'Acajutla',
            ],

            'Chalatenango' => [
                'Citalá', 'La Palma', 'San Ignacio',
                'Agua Caliente', 'Dulce Nombre de María', 'El Paraíso',
                'La Reina', 'Nueva Concepción', 'San Fernando',
                'San Francisco Morazán', 'San Rafael', 'Santa Rita',
                'Tejutla', 'Arcatao', 'Azacualpa', 'Cancasque',
                'Chalatenango', 'Comalapa', 'Concepción Quezaltepeque',
                'El Carrizal', 'La Laguna', 'Las Vueltas', 'Las Flores',
                'Nombre de Jesús', 'Nueva Trinidad', 'Ojos de Agua',
                'Potonico', 'San Antonio de la Cruz',
                'San Antonio Los Ranchos', 'San Francisco Lempa',
                'San Isidro Labrador', 'San Luis del Carmen',
                'San Miguel de Mercedes',
            ],

            'La Libertad' => [
                'Quezaltepeque', 'San Matías', 'San Pablo Tacachico',
                'Ciudad Arce', 'San Juan Opico', 'Colón', 'Jayaque',
                'Sacacoyo', 'Talnique', 'Tepecoyo',
                'Antiguo Cuscatlán', 'Huizúcar', 'Nuevo Cuscatlán',
                'San José Villanueva', 'Zaragoza', 'Chiltiupán',
                'Jicalapa', 'La Libertad', 'Tamanique', 'Teotepeque',
                'Comasagua', 'Santa Tecla',
            ],

            'San Salvador' => [
                'Aguilares', 'El Paisnal', 'Guazapa', 'Apopa', 'Nejapa',
                'Ilopango', 'San Martín', 'Soyapango', 'Tonacatepeque',
                'Ayutuxtepeque', 'Cuscatancingo', 'Ciudad Delgado',
                'Mejicanos', 'San Salvador', 'Panchimalco',
                'Rosario de Mora', 'San Marcos',
                'Santiago Texacuangos', 'Santo Tomás',
            ],

            'Cuscatlán' => [
                'Oratorio de Concepción', 'San Bartolomé Perulapía',
                'San José Guayabal', 'San Pedro Perulapán', 'Suchitoto',
                'Candelaria', 'Cojutepeque', 'El Carmen', 'El Rosario',
                'Monte San Juan', 'San Cristóbal', 'San Rafael Cedros',
                'San Ramón', 'Santa Cruz Analquito',
                'Santa Cruz Michapa', 'Tenancingo',
            ],

            'La Paz' => [
                'Cuyultitán', 'Olocuilta', 'San Juan Talpa',
                'San Luis Talpa', 'San Pedro Masahuat', 'Tapalhuaca',
                'San Francisco Chinameca', 'El Rosario', 'Jerusalén',
                'Mercedes La Ceiba', 'Paraíso de Osorio',
                'San Antonio Masahuat', 'San Emigdio',
                'San Juan Tepezontes', 'San Luis La Herradura',
                'San Miguel Tepezontes', 'San Pedro Nonualco',
                'Santa María Ostuma', 'Santiago Nonualco',
                'San Juan Nonualco', 'San Rafael Obrajuelo',
                'Zacatecoluca',
            ],

            'Cabañas' => [
                'Dolores', 'Guacotecti', 'San Isidro',
                'Sensuntepeque', 'Victoria', 'Cinquera',
                'Ilobasco', 'Jutiapa', 'Tejutepeque',
            ],

            'San Vicente' => [
                'Apastepeque', 'San Esteban Catarina',
                'San Ildefonso', 'San Lorenzo', 'San Sebastián',
                'Santa Clara', 'Santo Domingo', 'Guadalupe',
                'San Cayetano Istepeque', 'San Vicente', 'Tecoluca',
                'Tepetitán', 'Verapaz',
            ],

            'Usulután' => [
                'Alegría', 'Berlín', 'El Triunfo', 'Estanzuelas',
                'Jucuapa', 'Mercedes Umaña', 'Nueva Granada',
                'San Buenaventura', 'Santiago de María',
                'California', 'Concepción Batres', 'Ereguayquín',
                'Jucuarán', 'Ozatlán', 'San Dionisio', 'Santa Elena',
                'Santa María', 'Tecapán', 'Usulután', 'Jiquilisco',
                'Puerto El Triunfo', 'San Agustín',
                'San Francisco Javier',
            ],

            'San Miguel' => [
                'Carolina', 'Chapeltique', 'Ciudad Barrios',
                'Nuevo Edén de San Juan', 'San Antonio',
                'San Gerardo', 'San Luis de la Reina', 'Sesori',
                'Chirilagua', 'Comacarán', 'Moncagua', 'Quelepa',
                'San Miguel', 'Uluazapa', 'Chinameca', 'El Tránsito',
                'Lolotique', 'Nueva Guadalupe', 'San Jorge',
                'San Rafael Oriente',
            ],

            'Morazán' => [
                'Arambala', 'Cacaopera', 'Corinto', 'El Rosario',
                'Joateca', 'Jocoaitique', 'Meanguera', 'Perquín',
                'San Fernando', 'San Isidro', 'Torola', 'Chilanga',
                'Delicias de Concepción', 'El Divisadero',
                'Gualococti', 'Guatajiagua', 'Jocoro',
                'Lolotiquillo', 'Osicala', 'San Carlos',
                'San Francisco Gotera', 'San Simón', 'Sensembra',
                'Sociedad', 'Yamabal', 'Yoloaiquín',
            ],

            'La Unión' => [
                'Anamorós', 'Bolívar', 'Concepción de Oriente',
                'El Sauce', 'Lislique', 'Nueva Esparta', 'Pasaquina',
                'Polorós', 'San José', 'Santa Rosa de Lima',
                'Conchagua', 'El Carmen', 'Intipucá', 'La Unión',
                'Meanguera del Golfo', 'San Alejo', 'Yayantique',
                'Yucuaiquín',
            ],
        ];

        foreach ($departments as $department => $districts) {
            foreach ($districts as $district) {
                Zone::firstOrCreate([
                    'department' => $department,
                    'district'   => $district,
                ]);
            }
        }
    }
}