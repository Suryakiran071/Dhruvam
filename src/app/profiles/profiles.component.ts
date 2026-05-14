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
      role:"Vocal",
      photo:"assets/Adwaith.jpg",
      instagram:"https://www.youtube.com/"
    },
    {
      name:"Ram",
      role:"Vocal",
      photo:"assets/Ram.jpg",
      instagram:""
    },
    {
      name:"Aravind",
      role:"Vocals",
      photo:"assets/Aravind.jpg",
      instagram:""
    },
    {
      name:"Sangeetha",
      role:"Vocals",
      photo:"assets/Sangeetha.jpg",
      instagram:""
    },
    {
      name:"Nandana",
      role:"Vocals",
      photo:"assets/TG.jpg",
      instagram:""
    },
    {
      name:"Adharsh",
      role:"Lead Guitar",
      photo:"assets/Adharsh.png",
      instagram:""
    },
    {
      name:"Surya",
      role:"Keyboard",
      photo:"assets/Surya.jpg",
      instagram:""
    },
    {
      name:"Govind",
      role:"Drummer",
      photo:"assets/Govind.jpg",
      instagram:""
    },
    {
      name:"Aadi",
      role:"Rhythm Guitar",
      photo:"assets/Aadi.jpg",
      instagram:""
    },
    {
      name:"Aadithyan",
      role:"Violin",
      photo:"assets/Mundakkal.jpg",
      instagram:""
    },
    {
      name:"Saavan",
      role:"Keyboard",
      photo:"assets/Saavan.jpg",
      instagram:""
    },
    {
      name:"Fahad",
      role:"Bass",
      photo:"assets/Fahad.jpg",
      instagram:""
    }
  ]
}
