export class Service {
  name: string;
  folder: string;
  id: string;

  searchRequest: string;
  dataRequest: string;
  detailsRequest: string;
  bboxFilteredRequest: string;

  constructor(name: string, folder: string, id: string) {
    this.name = name;
    this.folder = folder;
    this.id = id;

    this.searchRequest = '@search' + this.name;
    this.dataRequest = '@data' + this.name;
    this.detailsRequest = '@details' + this.name;
    this.bboxFilteredRequest = '@bboxFilteredData' + this.name;
  }

  searchJson() {
    return `${this.folder}/search.json`;
  }

  dataJson() {
    return `${this.folder}/data.json`;
  }

  detailsJson() {
    return `${this.folder}/details.json`;
  }

  bboxFilteredJson() {
    return `${this.folder}/bbox_filtered.json`;
  }
}

export const GNSS_STATIONS_WITH_PRODUCTS = new Service(
  'GNSS Stations with Products',
  'GNSS_Stations_with_Products',
  '6b4f5899-edfa-4739-a20b-55be5088a825',
);

export const NFO_Marmara_VP_VS = new Service(
  'Marmara Vp/Vs',
  'NFO_Marmara_Vp_Vs',
  '2774cc18-1a66-41bf-8aff-bc78b0c92e8f',
);