// Dotación mínima de medicamentos (sin nombre comercial)
// Fuente: listado de dotación para centros >300 hombres
const DOTACION_MINIMA = [
  { grupo: "MUCOLÍTICOS, DESCONGESTIVOS", principioActivo: "Acetilcisteína", dosis: "200 mg", categoria: "sobres", presentacion: "E/30 Sobres", stockMinimo: 240 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Aciclovir", dosis: "5 %", categoria: "crema", presentacion: "Tubo 2 gr.", stockMinimo: 16 },
  { grupo: "ANTIVIRALES", principioActivo: "Aciclovir", dosis: "200 mg", categoria: "comprimidos", presentacion: "E/25 Comp.", stockMinimo: 100 },
  { grupo: "ANTISEP., DESINFECT.", principioActivo: "Agua Oxigenada", dosis: "10 Vol.", categoria: "otros", presentacion: "E/250 ml.", stockMinimo: 16 },
  { grupo: "ANTISEP., DESINFECT.", principioActivo: "Alcohol 70°", dosis: "70°", categoria: "otros", presentacion: "E/1000 ml.", stockMinimo: 8 },
  { grupo: "GINECOLÓGICO", principioActivo: "Aluminio potasio-sulfato/Benzalconio", dosis: "8 gr. / 600 mg.", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 4 },
  { grupo: "HEMOSTATICOS", principioActivo: "Aminocapróico ácido", dosis: "4 gr.", categoria: "ampollas", presentacion: "E/6 Ampollas", stockMinimo: 20 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Amiodarona", dosis: "150 mg.", categoria: "vial", presentacion: "E/5 Ampollas", stockMinimo: 24 },
  { grupo: "ANTIHIPERTENSIVOS", principioActivo: "Amlodipino", dosis: "5 mg.", categoria: "comprimidos", presentacion: "E/30 Comp.", stockMinimo: 120 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Amoxicilina", dosis: "500 mg.", categoria: "capsulas", presentacion: "E/20 Cápsulas", stockMinimo: 480 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Amoxicilina/Clavulánico", dosis: "875 mg. / 125 mg.", categoria: "sobres", presentacion: "E/12 Sobres", stockMinimo: 240 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Antibiótico-Dexametasona", dosis: "", categoria: "oftalmologico", presentacion: "E/10 Unidosis", stockMinimo: 40 },
  { grupo: "ANTICATARRALES, ANTIGRIPALES", principioActivo: "Antigripales", dosis: "", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 1200 },
  { grupo: "ANTIHEMORROIDALES", principioActivo: "Antihemorroidal", dosis: "", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 8 },
  { grupo: "AINE.s", principioActivo: "Aspirina", dosis: "500 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 600 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Atropina", dosis: "1/1000", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Azitromicina", dosis: "500 mg.", categoria: "comprimidos", presentacion: "E/3 Comp.", stockMinimo: 16 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Bencilpenicilina-Benzatina", dosis: "2.400.000 UI", categoria: "vial", presentacion: "E/1 Vial", stockMinimo: 16 },
  { grupo: "ANESTESICOS LOCALES", principioActivo: "Benzocaína", dosis: "5 %", categoria: "otros", presentacion: "E/5 ml.", stockMinimo: 8 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Betametasona / Gentamicina", dosis: "0,5 / 1 mg.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 12 },
  { grupo: "ANTIPARKINSONIANO", principioActivo: "Biperideno", dosis: "5 mg.", categoria: "vial", presentacion: "E/5 Ampollas 1 ml.", stockMinimo: 20 },
  { grupo: "ANTITUSIVOS", principioActivo: "Bronquial DEF", dosis: "", categoria: "otros", presentacion: "E/125 Mililitros", stockMinimo: 20 },
  { grupo: "BUCOFARINGEOS", principioActivo: "Bucofaringeos", dosis: "", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 400 },
  { grupo: "ESPASMOLITICOS", principioActivo: "Butalpina compuesta", dosis: "20/2500 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "ESPASMOLITICOS", principioActivo: "Butilescopolamina, bromuro", dosis: "10 mg.", categoria: "comprimidos", presentacion: "E/60 Grageas", stockMinimo: 240 },
  { grupo: "ESPASMOLITICOS", principioActivo: "Butilescopolamina, bromuro", dosis: "20 mg.", categoria: "ampollas", presentacion: "E/6 Ampollas 1 ml.", stockMinimo: 48 },
  { grupo: "ANTIHIPERTENSIVOS", principioActivo: "Captopril", dosis: "25 mg.", categoria: "comprimidos", presentacion: "E/60 Comp.", stockMinimo: 240 },
  { grupo: "ANTIDOTOS", principioActivo: "Carbón Activado", dosis: "", categoria: "otros", presentacion: "E/25 Gramos", stockMinimo: 8 },
  { grupo: "ANTIHISTAMINICOS", principioActivo: "Cetirizina", dosis: "10 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Ciprofloxacino", dosis: "0,20 %", categoria: "otros", presentacion: "Bolsa IV 100 ml.", stockMinimo: 4 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Ciprofloxacino", dosis: "500 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "ANTISEP., DESINFECT.", principioActivo: "Clorhexidina", dosis: "5 %", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 12 },
  { grupo: "ESTOMATOLOGICOS", principioActivo: "Clorhexidina (colutorio)", dosis: "0,12 %", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 12 },
  { grupo: "ANTISEP., DESINFECT.", principioActivo: "Clorhexidina (spray)", dosis: "1 %", categoria: "otros", presentacion: "Nebulizador 100 ml.", stockMinimo: 8 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Clorpromazina", dosis: "25 mg.", categoria: "vial", presentacion: "E/5 Ampollas", stockMinimo: 8 },
  { grupo: "ANESTESICOS LOCALES", principioActivo: "Cloruro de etilo", dosis: "100 %", categoria: "otros", presentacion: "E/100 gr.", stockMinimo: 4 },
  { grupo: "ELECTROLITOS", principioActivo: "Cloruro Potásico 2 M", dosis: "2 M", categoria: "vial", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Clotrimazol", dosis: "10 mg.", categoria: "crema", presentacion: "Tubos 5 gr (6)", stockMinimo: 8 },
  { grupo: "GINECOLÓGICO", principioActivo: "Clotrimazol (Gine)", dosis: "100 mg.", categoria: "ovulos", presentacion: "E/6 Comp. Vag.", stockMinimo: 24 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Cloxacilina", dosis: "1 gr.", categoria: "vial", presentacion: "E/1 Vial", stockMinimo: 16 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Cloxacilina", dosis: "500 mg.", categoria: "capsulas", presentacion: "E/12 Cápsulas", stockMinimo: 144 },
  { grupo: "OTROS", principioActivo: "Depuradores de agua comp.", dosis: "5 mg.", categoria: "comprimidos", presentacion: "L/6 Comp.", stockMinimo: 960 },
  { grupo: "CORTICOIDES", principioActivo: "Dexametasona/Tiamina/Cianocobalamina", dosis: "4 mg/50mg/250mcg", categoria: "ampollas", presentacion: "E/6 Ampollas 2 ml.", stockMinimo: 48 },
  { grupo: "ANTIHISTAMINICOS", principioActivo: "Dexclorfeniramina", dosis: "2 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "ANTITUSIVOS", principioActivo: "Dextrometorfano", dosis: "15 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 160 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Diazepam", dosis: "10 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Diazepam", dosis: "5 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 160 },
  { grupo: "AINE.s", principioActivo: "Diclofenaco", dosis: "50 mg.", categoria: "comprimidos", presentacion: "E/40 Comp.", stockMinimo: 160 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Diclofenaco", dosis: "0,10 %", categoria: "oftalmologico", presentacion: "E/10 Unidosis", stockMinimo: 80 },
  { grupo: "AINE.s", principioActivo: "Diclofenaco", dosis: "75 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Digoxina", dosis: "0,25 mg.", categoria: "comprimidos", presentacion: "E/50 Comp.", stockMinimo: 100 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Digoxina", dosis: "0,25 mg.", categoria: "ampollas", presentacion: "E/5 Ampollas", stockMinimo: 20 },
  { grupo: "ANTICINETOSICO", principioActivo: "Dimenhidrinato", dosis: "100 mg.", categoria: "supositorios", presentacion: "E/4 Supositorios", stockMinimo: 16 },
  { grupo: "ANTICINETOSICO", principioActivo: "Dimenhidrinato", dosis: "50 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 800 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Doxiciclina", dosis: "100 mg.", categoria: "capsulas", presentacion: "E/20 Cápsulas", stockMinimo: 80 },
  { grupo: "ANTITROMBÓTICOS", principioActivo: "Enoxaparina", dosis: "40 mg.", categoria: "otros", presentacion: "E/10 Jeringas", stockMinimo: 40 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Epinefrina", dosis: "1 mg.", categoria: "ampollas", presentacion: "JP 1 ml.", stockMinimo: 8 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Epinefrina", dosis: "1 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 80 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Epitelizante Pomada Oftálmica", dosis: "", categoria: "oftalmologico", presentacion: "Tubo 3 gr.", stockMinimo: 8 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Etilefrina", dosis: "7,5 mg.", categoria: "gotas", presentacion: "E/25 ml.", stockMinimo: 4 },
  { grupo: "CARDIOLÓGICOS", principioActivo: "Fenitoína", dosis: "250 mg.", categoria: "vial", presentacion: "E/1 Ampolla", stockMinimo: 16 },
  { grupo: "ANTIDOTOS", principioActivo: "Flumazenilo", dosis: "0,1 mg.", categoria: "vial", presentacion: "E/5 Ampollas", stockMinimo: 8 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Fluoresceína", dosis: "20 mg.", categoria: "oftalmologico", presentacion: "Colirio 10 ml.", stockMinimo: 4 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Fotoprotector crema", dosis: "", categoria: "crema", presentacion: "Tubo 50 gr.", stockMinimo: 120 },
  { grupo: "DIURETICOS", principioActivo: "Furosemida", dosis: "20 mg.", categoria: "ampollas", presentacion: "E/5 Ampollas", stockMinimo: 40 },
  { grupo: "DIURETICOS", principioActivo: "Furosemida", dosis: "40 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "ANTIHEMORRAGICO", principioActivo: "Gelatina Hemostática", dosis: "", categoria: "otros", presentacion: "E/10 Láminas", stockMinimo: 40 },
  { grupo: "ANTIBIOTICOS", principioActivo: "Gentamicina", dosis: "240 mg.", categoria: "vial", presentacion: "E/1 Vial", stockMinimo: 16 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Haloperidol", dosis: "5 mg.", categoria: "ampollas", presentacion: "E/5 Ampollas", stockMinimo: 20 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Haloperidol", dosis: "2 mg.", categoria: "gotas", presentacion: "Gotas E/30 ml.", stockMinimo: 4 },
  { grupo: "DIURETICOS", principioActivo: "Hidroclorotiazida", dosis: "50 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "CORTICOIDES", principioActivo: "Hidrocortisona", dosis: "100 mg.", categoria: "vial", presentacion: "E/1 Ampolla", stockMinimo: 8 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Hidrocortisona", dosis: "50 mg. / 1 gr.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 8 },
  { grupo: "SUSTITUTOS PLASMA", principioActivo: "Hidroxietilamidón", dosis: "6 %", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 24 },
  { grupo: "AINE.s", principioActivo: "Ibuprofeno", dosis: "400 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 320 },
  { grupo: "INSULINAS", principioActivo: "Insulina Acción Rápida", dosis: "100 UI / ml.", categoria: "vial", presentacion: "E/1 Vial 10 ml.", stockMinimo: 4 },
  { grupo: "ANTIMICÓTICOS", principioActivo: "Ketoconazol", dosis: "200 mg.", categoria: "comprimidos", presentacion: "E/10 Comp.", stockMinimo: 80 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Ketoprofeno", dosis: "18 mg./gr.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 40 },
  { grupo: "LAXANTES", principioActivo: "Lactulosa", dosis: "3,33 gr./5 ml.", categoria: "otros", presentacion: "E/200 ml.", stockMinimo: 12 },
  { grupo: "LAXANTES", principioActivo: "Lauril sulfato Na, acetato / Sodio Citrato", dosis: "45/450 mg.", categoria: "otros", presentacion: "E/4 Canuletas", stockMinimo: 48 },
  { grupo: "GINECOLÓGICO", principioActivo: "Levonorgestrel", dosis: "1,5 mg.", categoria: "comprimidos", presentacion: "E/1 Comp.", stockMinimo: 4 },
  { grupo: "ANESTESICOS LOCALES", principioActivo: "Lidocaína", dosis: "2 %", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "ANTIDIARREICOS", principioActivo: "Loperamida", dosis: "2 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 160 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Lorazepam", dosis: "1 mg.", categoria: "comprimidos", presentacion: "E/25 Comp.", stockMinimo: 100 },
  { grupo: "ANTIULCEROSOS Y ANTIACIDOS", principioActivo: "Magaldrato", dosis: "400 mg.", categoria: "comprimidos", presentacion: "E/40 Comp.", stockMinimo: 640 },
  { grupo: "ANTIHELMINICOS", principioActivo: "Mebendazol", dosis: "100 mg.", categoria: "comprimidos", presentacion: "E/6 Comp.", stockMinimo: 48 },
  { grupo: "AINE.s", principioActivo: "Metamizol", dosis: "500 mg.", categoria: "capsulas", presentacion: "E/20 Cápsulas", stockMinimo: 240 },
  { grupo: "AINE.s", principioActivo: "Metamizol", dosis: "2 gr.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 160 },
  { grupo: "OXITOCICOS", principioActivo: "Metilergometrina", dosis: "0,2 mg.", categoria: "ampollas", presentacion: "E/3 Ampollas 1 ml.", stockMinimo: 12 },
  { grupo: "OXITOCICOS", principioActivo: "Metilergometrina", dosis: "0,25 mg.", categoria: "gotas", presentacion: "Gotas E/10 ml.", stockMinimo: 8 },
  { grupo: "CORTICOIDES", principioActivo: "Metilprednisolona", dosis: "40 mg.", categoria: "vial", presentacion: "E/1 Ampolla", stockMinimo: 12 },
  { grupo: "CORTICOIDES", principioActivo: "Metilprednisolona", dosis: "20 mg.", categoria: "otros", presentacion: "JP 1 ml.", stockMinimo: 8 },
  { grupo: "ANTIEMETICOS", principioActivo: "Metoclopramida", dosis: "10 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "ANTIEMETICOS", principioActivo: "Metoclopramida", dosis: "10 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "AMEBICIDAS", principioActivo: "Metronidazol", dosis: "250 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 80 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Miconazol", dosis: "20 mg.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 8 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Mupirocina", dosis: "2,00 %", categoria: "crema", presentacion: "Tubo 15 gr.", stockMinimo: 12 },
  { grupo: "ANTIANGINOSOS", principioActivo: "Nitroglicerina", dosis: "1 mg.", categoria: "comprimidos", presentacion: "E/20 grageas", stockMinimo: 80 },
  { grupo: "ANTIANGINOSOS", principioActivo: "Nitroglicerina", dosis: "400 mcg.", categoria: "otros", presentacion: "Aerosol 200 dosis", stockMinimo: 4 },
  { grupo: "ANTIANGINOSOS", principioActivo: "Nitroglicerina", dosis: "5 mg.", categoria: "otros", presentacion: "E/12 Ampollas", stockMinimo: 8 },
  { grupo: "ANTIULCEROSOS Y ANTIACIDOS", principioActivo: "Omeprazol", dosis: "20 mg.", categoria: "capsulas", presentacion: "E/28 Cápsulas", stockMinimo: 224 },
  { grupo: "ANTIULCEROSOS Y ANTIACIDOS", principioActivo: "Omeprazol", dosis: "40 mg.", categoria: "vial", presentacion: "E/1 Ampolla", stockMinimo: 4 },
  { grupo: "AINE.s", principioActivo: "Paracetamol", dosis: "1 gr.", categoria: "vial", presentacion: "E/12 Viales", stockMinimo: 12 },
  { grupo: "AINE.s", principioActivo: "Paracetamol", dosis: "500 mg.", categoria: "capsulas", presentacion: "E/20 Cápsulas", stockMinimo: 800 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Pentosano polisulfúrico, ácido", dosis: "1 mg.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 12 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Permetrina", dosis: "1,50 %", categoria: "otros", presentacion: "E/125 ml.", stockMinimo: 4 },
  { grupo: "ANTISEP., DESINFECT.", principioActivo: "Povidona yodada", dosis: "10,00 %", categoria: "otros", presentacion: "E/20 ml.", stockMinimo: 20 },
  { grupo: "CORTICOIDES", principioActivo: "Prednisona", dosis: "5 mg.", categoria: "comprimidos", presentacion: "E/30 Comp.", stockMinimo: 60 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Prometazina", dosis: "20 mg.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 12 },
  { grupo: "SISTEMA NERVIOSO", principioActivo: "Propofol", dosis: "10 mg.", categoria: "ampollas", presentacion: "E/5 Ampollas", stockMinimo: 8 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Protector labial", dosis: "", categoria: "otros", presentacion: "Barra de 4 gr.", stockMinimo: 60 },
  { grupo: "ANTIULCEROSOS Y ANTIACIDOS", principioActivo: "Ranitidina", dosis: "50 mg.", categoria: "ampollas", presentacion: "E/10 Ampollas", stockMinimo: 40 },
  { grupo: "BRONCODILATADORES", principioActivo: "Salbutamol", dosis: "100 mcg.", categoria: "otros", presentacion: "Aerosol", stockMinimo: 24 },
  { grupo: "BRONCODILATADORES", principioActivo: "Salbutamol", dosis: "500 mcg.", categoria: "ampollas", presentacion: "E/6 Ampollas 1 ml.", stockMinimo: 8 },
  { grupo: "SUEROS", principioActivo: "Suero Bicarbonato sódico", dosis: "1,40 %", categoria: "otros", presentacion: "E/250 ml.", stockMinimo: 24 },
  { grupo: "SUEROS", principioActivo: "Suero fisiológico DEF", dosis: "0,90 %", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 4 },
  { grupo: "SUEROS", principioActivo: "Suero fisiológico DEF", dosis: "0,90 %", categoria: "otros", presentacion: "E/100 ml.", stockMinimo: 8 },
  { grupo: "SUEROS", principioActivo: "Suero glucosado DEF", dosis: "5,00 %", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 20 },
  { grupo: "SUEROS", principioActivo: "Suero glucosalino DEF", dosis: "", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 20 },
  { grupo: "SUEROS", principioActivo: "Suero Ringer Lactato DEF", dosis: "", categoria: "otros", presentacion: "E/500 ml.", stockMinimo: 20 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Sulfadiazina Argéntica", dosis: "10 mg.", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 16 },
  { grupo: "ANESTESICOS LOCALES", principioActivo: "Tetracaína (Lub. Urológico)", dosis: "7,5 mg.", categoria: "crema", presentacion: "Tubo 25 gr.", stockMinimo: 4 },
  { grupo: "OTOLÓGICOS", principioActivo: "Tetracaína / Clavo", dosis: "100 mg.", categoria: "gotas", presentacion: "Gotas 7,5 ml.", stockMinimo: 8 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Tetracaína / Oxibuprocaina", dosis: "1 mg./4 mg.", categoria: "oftalmologico", presentacion: "Colirio 10 mililitros", stockMinimo: 4 },
  { grupo: "ANSIOLÍTICOS Y RELAJANTES", principioActivo: "Tetrazepam", dosis: "50 mg.", categoria: "comprimidos", presentacion: "E/30 Comp.", stockMinimo: 120 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Tobramicina", dosis: "0,30 %", categoria: "oftalmologico", presentacion: "Colirio 5 mililitros", stockMinimo: 8 },
  { grupo: "OFTALMOLÓGICOS", principioActivo: "Tobramicina", dosis: "0,30 %", categoria: "crema", presentacion: "Tubo 3,5 gr.", stockMinimo: 8 },
  { grupo: "SULFAMIDAS", principioActivo: "Trimetoxazol", dosis: "80/400 mg.", categoria: "comprimidos", presentacion: "E/20 Comp.", stockMinimo: 240 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Vaselina estéril DEF", dosis: "100 %", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 16 },
  { grupo: "DERMATOLÓGICOS", principioActivo: "Vitamina A+D", dosis: "", categoria: "crema", presentacion: "Tubo 30 gr.", stockMinimo: 16 }
];

async function seedDotacionIfEmpty() {
  const meds = await getMedicamentos();
  if (meds.length > 0) return { seeded: false, count: 0 };

  let count = 0;
  for (const d of DOTACION_MINIMA) {
    const nombre = d.principioActivo + (d.dosis ? " " + d.dosis : "");
    await addMedicamento({
      barcode: null,
      nombreComercial: nombre, // provisional hasta poner marca
      principioActivo: d.principioActivo,
      dosis: d.dosis || "",
      presentacion: d.presentacion || "",
      grupoTerapeutico: d.grupo || "",
      categoria: d.categoria || "otros",
      stockMinimo: d.stockMinimo || 0,
      ubicacion: "",
      notas: "Dotación mínima",
      foto: null,
      esDotacion: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    count++;
  }
  return { seeded: true, count };
}

async function importarDotacionFaltante() {
  const meds = await getMedicamentos();
  const key = (m) => ((m.principioActivo || "") + "|" + (m.dosis || "") + "|" + (m.presentacion || "")).toLowerCase();
  const existing = new Set(meds.map(key));
  let added = 0;
  for (const d of DOTACION_MINIMA) {
    const k = (d.principioActivo + "|" + (d.dosis || "") + "|" + (d.presentacion || "")).toLowerCase();
    if (existing.has(k)) continue;
    const nombre = d.principioActivo + (d.dosis ? " " + d.dosis : "");
    await addMedicamento({
      barcode: null,
      nombreComercial: nombre,
      principioActivo: d.principioActivo,
      dosis: d.dosis || "",
      presentacion: d.presentacion || "",
      grupoTerapeutico: d.grupo || "",
      categoria: d.categoria || "otros",
      stockMinimo: d.stockMinimo || 0,
      ubicacion: "",
      notas: "Dotación mínima",
      foto: null,
      esDotacion: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    existing.add(k);
    added++;
  }
  return added;
}
