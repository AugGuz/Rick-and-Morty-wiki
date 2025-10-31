import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Character } from '../../services/character.service';
import { CharacterModalService } from '../../services/characterModal.service';

@Component({
  selector: 'app-character-card',
  imports: [CommonModule],
  templateUrl: './character-card.html',
  styleUrl: './character-card.css'
})
export class CharacterCard {
  @Input() character!: Character;
  private characterModalService = inject(CharacterModalService);

  openCharacterModal() {
    this.characterModalService.open(this.character.id);
  }
}
