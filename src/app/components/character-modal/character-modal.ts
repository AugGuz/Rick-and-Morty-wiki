import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService, Character } from '../../services/character.service';
import { EpisodeService } from '../../services/episode.service';
import { EpisodeModalService } from '../../services/episodeModal.service';
import { LocationService } from '../../services/location.service';
import { CharacterCard } from '../character-card/character-card';
import { CharacterModalService } from '../../services/characterModal.service';

@Component({
  selector: 'app-character-modal',
  imports: [CommonModule],
  templateUrl: './character-modal.html',
  styleUrl: './character-modal.css'
})
export class CharacterModalComponent {

    characterModalService = inject(CharacterModalService);
    
    @HostListener('document:keydown', ['$event'])
    onEscapePress(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.characterModalService.close();
        }
    }
    
    formatEpisodeCode(code: string): string {
        // Convert S01E01 to "Season 1 Episode 1"
        const match = code.match(/S(\d+)E(\d+)/);
        if (match) {
            const season = parseInt(match[1], 10);
            const episode = parseInt(match[2], 10);
            return `Season ${season} Episode ${episode}`;
        }
        return code;
    }
    
}