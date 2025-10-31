import { CommonModule } from "@angular/common";
import { Component, computed, effect, HostListener, inject, Injectable, signal } from "@angular/core";
import { CharacterService, Character } from "../services/character.service";
import { EpisodeService, Episode } from "./episode.service";


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
        
        this.characterService.getCharacter(characterId).subscribe(character => {
            this.character.set(character);
            
            // Fetch episode details
            if (character.episode && character.episode.length > 0) {
                const episodeIds = character.episode
                    .map(url => url.split('/').pop())
                    .join(',');
                
                this.episodeService.getMultipleEpisodes(episodeIds).subscribe(episodes => {
                    // Handle both single episode (object) and multiple episodes (array)
                    this.episodes.set(Array.isArray(episodes) ? episodes : [episodes]);
                });
            }
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
