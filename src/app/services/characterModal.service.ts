import { Component, computed, effect, HostListener, inject, Injectable, signal } from "@angular/core";
import { CharacterService, Character } from "../services/character.service";
import { EpisodeService, Episode } from "./episode.service";
import { switchMap, tap, of } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class CharacterModalService {

    character = signal<Character | null>(null);
    episodes = signal<Episode[]>([]);
    
    constructor(
        private characterService: CharacterService,
        private episodeService: EpisodeService,
    ) {}


    open(characterId: number) {
        this.character.set(null);
        this.episodes.set([]);
        
        this.characterService.getCharacter(characterId).pipe(
            tap(character => this.character.set(character)),
            switchMap(character => {
                // Fetch episode details if episodes exist
                if (character.episode && character.episode.length > 0) {
                    const episodeIds = character.episode
                        .map(url => url.split('/').pop())
                        .join(',');
                    
                    return this.episodeService.getMultipleEpisodes(episodeIds);
                }
                return of([]); // Return empty array if no episodes
            })
        ).subscribe(episodes => {
            this.episodes.set(Array.isArray(episodes) ? episodes : [episodes]);
        });
    }

    close() {
        this.character.set(null);
        this.episodes.set([]);
    }

    isOpen() {
        return this.character() !== null;
    }

}
