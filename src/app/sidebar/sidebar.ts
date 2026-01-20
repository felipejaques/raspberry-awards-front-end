import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  public close(): void {
    this.closeSidebar.emit();
  }
}
