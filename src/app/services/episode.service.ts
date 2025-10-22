import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface EpisodeApiResponse {
  info: {      
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Episode[]; 
}

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {
  private rickApi = 'https://rickandmortyapi.com/api';
  private http = inject(HttpClient);

  getEpisodes(page: number = 1): Observable<EpisodeApiResponse> {
    return this.http.get<EpisodeApiResponse>(`${this.rickApi}/episode?page=${page}`);
  }

  getEpisode(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.rickApi}/episode/${id}`);
  }

  searchEpisodes(name: string): Observable<EpisodeApiResponse> {
    return this.http.get<EpisodeApiResponse>(`${this.rickApi}/episode?name=${name}`);
  }

}
