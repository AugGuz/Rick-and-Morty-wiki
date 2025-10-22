import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Character {
    id: number;
    name: string;
    age?: number;
    status: string;
    species: string;
    type: string;
    episode: string[];
    image: string;
    gender: string; 
    origin: {
        name: string;
    };
}

export interface ApiResponse {
    info: {
        count: number;
        pages: number;
        next: string | null;
        prev: string | null;
    };
    results: Character[];
}



@Injectable({
  providedIn: 'root'
})
export class CharacterService {
    private rickApi = 'https://rickandmortyapi.com/api';
    private http = inject(HttpClient);

    getCharacters(page: number = 1): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.rickApi}/character?page=${page}`);
    }

    getCharacter(id: number): Observable<Character> {
        return this.http.get<Character>(`${this.rickApi}/character/${id}`);
    }

    searchCharacter(name: string): Observable<Response> {
        return this.http.get<Response>(`${this.rickApi}/character/?name=${name}`);
    }
    


}