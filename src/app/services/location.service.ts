import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

export interface Location {
    id: number;
    name: string;
    type: string;
    dimension: string;
    residents: string[];
    url: string;
    created: string;
}

export interface locationapiResponse {
    info : {
        count: number;
        pages: number;
        next: string | null;
        prev: string | null;
    };
    results: Location[];
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private http = inject(HttpClient);

    getLocations(page: number = 1): Observable<locationapiResponse> {
        return this.http.get<locationapiResponse>(`https://rickandmortyapi.com/api/location?page=${page}`);
    }

    getdimension(id: number): Observable<Location> {
        return this.http.get<Location>(`https://rickandmortyapi.com/api/location/${id}`);
    }

    searchLocation(name: string): Observable<locationapiResponse> {
        return this.http.get<locationapiResponse>(`https://rickandmortyapi.com/api/location?name=${name}`);
    }

    getAllLocations(): Observable<locationapiResponse> {
        return this.http.get<locationapiResponse>(`https://rickandmortyapi.com/api/location`);
    }

    getresidents(id: number): Observable<Location> {
        return this.http.get<Location>(`https://rickandmortyapi.com/api/location/${id}`);
    }

}