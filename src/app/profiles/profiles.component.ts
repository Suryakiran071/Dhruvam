import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css'
})
export class ProfilesComponent {
  bandMembers = [
    {
      name:"Adwaith",
      role:"Vocals",
      photo:""
    },
    {
      name:"Ram",
      role:"Vocals",
      photo:""
    },
    {
      name:"Aravind",
      role:"Vocals",
      photo:""
    },
    {
      name:"Adwaith",
      role:"Vocals",
      photo:""
    },
    {
      name:"Ram",
      role:"Vocals",
      photo:""
    },
    {
      name:"Aravind",
      role:"Vocals",
      photo:""
    }
  ]
}
