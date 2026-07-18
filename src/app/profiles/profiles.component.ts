import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface BandMember {
  name: string;
  role: string;
  photo: string;
  instaid: string;
}

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css'
})
export class ProfilesComponent {
  bandMembers: BandMember[] = [
    {
      name: 'Adwaith',
      role: 'Vocals',
      photo: 'assets/Adwaith.jpeg',
      instaid: 'https://www.instagram.com/adwaith_menon_4/'
    },
    {
      name: 'Ram',
      role: 'Vocals',
      photo: 'assets/Ram.jpeg',
      instaid: 'https://www.instagram.com/_ram_j_/'
    },
    {
      name: 'Aravind',
      role: 'Vocals',
      photo: 'assets/Aravind.png',
      instaid: 'https://www.instagram.com/arav1nd.rajeev/'
    },
    {
      name: 'Sangeetha',
      role: 'Vocals',
      photo: 'assets/Sangeetha.jpeg',
      instaid: 'https://www.instagram.com/__.sangeeetaaa.__/'
    },
    {
      name: 'TG',
      role: 'Vocals',
      photo: 'assets/TG.jpeg',
      instaid: 'https://www.instagram.com/_nandanatg_/'
    },
    {
      name: 'Adarsh',
      role: 'Lead Guitar',
      photo: 'assets/Adarsh.jpeg',
      instaid: 'https://www.instagram.com/adharsh_music/'
    },
    {
      name: 'Surya',
      role: 'Keys',
      photo: 'assets/Surya.jpeg',
      instaid: 'https://www.instagram.com/s.u.r_y.a/'
    },
    {
      name: 'Govind',
      role: 'Drums',
      photo: 'assets/Govind.jpg',
      instaid: 'https://www.instagram.com/govnnd/'
    },
    {
      name: 'Fahad',
      role: 'Bass',
      photo: 'assets/Fahad.jpeg',
      instaid: 'https://www.instagram.com/fahad_.lll/'
    },
    {
      name: 'Aadi',
      role: 'Guitar',
      photo: 'assets/Aadi.jpeg',
      instaid: 'https://www.instagram.com/a.k.a_aadi/'
    },
    {
      name: 'Saavan',
      role: 'Keys',
      photo: 'assets/Sravan.jpeg',
      instaid: 'https://www.instagram.com/sravan_music/'
    },
    {
      name: 'Mundakkal',
      role: 'Violin',
      photo: 'assets/Mundakkal.jpg',
      instaid: 'https://www.instagram.com/adithyan_s_mundackal/'
    }
  ];
}
