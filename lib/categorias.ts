// Mapeamento: categoria amigável -> tags OpenStreetMap (Overpass)
// Adicionar novos tipos de negócio = adicionar uma entrada aqui.
export type CategoriaDef = {
  id: string;
  label: string;
  tags: string[]; // entradas Overpass: "key=value" ou "key~regex"
  idiomasHint?: string;
};

export const CATEGORIAS: CategoriaDef[] = [
  { id: "barbearia", label: "Barbearias", tags: ["shop=hairdresser", "shop~barber"] },
  { id: "construtora", label: "Construtoras e Reformas", tags: ["craft=builder", "craft=plasterer", "craft=roofer", "craft=carpenter", "shop=doityourself", "office=construction_company", "craft=painter"] },
  { id: "acaiteria", label: "Açaíterias e Smoothies", tags: ["shop=deli", "cuisine~acai", "shop=juice", "amenity=cafe"] },
  { id: "sorveteria", label: "Sorveterias e Gelaterias", tags: ["amenity=ice_cream", "shop=confectionery", "cuisine~ice_cream"] },
  { id: "academia", label: "Academias e CrossFit", tags: ["leisure=fitness_centre", "leisure=sports_centre", "sport~fitness|crossfit", "leisure=stadium"] },
  { id: "restaurante", label: "Restaurantes", tags: ["amenity=restaurant"] },
  { id: "pizzaria", label: "Pizzarias", tags: ["amenity=restaurant", "cuisine~pizza"] },
  { id: "cafe", label: "Cafeterias", tags: ["amenity=cafe"] },
  { id: "salao", label: "Salões de Beleza", tags: ["shop=beauty", "shop=hairdresser"] },
  { id: "petshop", label: "Pet Shops e Banho", tags: ["shop=pet", "shop=pet_grooming"] },
  { id: "mecanica", label: "Oficinas Mecânicas", tags: ["shop=car_repair"] },
  { id: "floricultura", label: "Floriculturas", tags: ["shop=florist"] },
  { id: "padaria", label: "Padarias", tags: ["shop=bakery"] },
  { id: "otica", label: "Óticas", tags: ["shop=optician"] },
  { id: "farmacia", label: "Farmácias de Bairro", tags: ["amenity=pharmacy"] },
  { id: "cervejaria", label: "Cervejarias e Bares", tags: ["amenity=pub", "amenity=bar", "craft=brewery"] },
  { id: "dentista", label: "Clínicas Odontológicas", tags: ["amenity=dentist", "healthcare=dentist"] },
  { id: "advogado", label: "Escritórios de Advocacia", tags: ["office=lawyer"] },
  { id: "contabilidade", label: "Contabilidades", tags: ["office=accountant", "office=tax_advisor"] },
  { id: "imobiliaria", label: "Imobiliárias", tags: ["office=estate_agent"] },
];

export function getCategoria(id: string): CategoriaDef | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}
