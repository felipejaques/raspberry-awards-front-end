import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('raspberry-awards');
  sidebarOpen = signal(false);

  public toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  public closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
