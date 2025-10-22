import { CharacterService } from "./character.service";
import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LocationService } from "./location.service";
import { Episode } from "./episode.service";

export interface EpisodeModalData {
    episode: Episode;
    characters: any[];
    locations: any[];
}

@Injectable({
    providedIn: 'root' })
export class EpisodeModalService {
    private http = inject(HttpClient);
    private characterService = inject(CharacterService);
    private locationService = inject(LocationService);
    isOpen = signal(false);
    episodeData = signal<EpisodeModalData | null>(null);

    openModal(episode: Episode) {
        this.episodeData.set({ episode, characters: [], locations: [] });
        this.isOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.isOpen.set(false);
        this.episodeData.set(null);
        document.body.style.overflow = 'auto';
    }
}
