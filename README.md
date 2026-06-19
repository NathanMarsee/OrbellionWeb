# Orbellion Web

Orbellion Web is a WIP tool for playing a customized version of the Perfect Draw! ttrpg online. We plan to extend the functionality to support the base version of Perfect Draw once we complete this initial goal.

## What does it do?

Orbellion Web allows 2 to 4 players to interact on a 2d virtual tabletop (as well as a theoretically infinite number of spectators). Players bring their own deck of custom cards they created in the deck page, and can access their deck, a hand of cards, their discard pile, and the battlefield. Cards can be drawn from the deck (to hand) reordered in hand, dragged back to the deck or to the discard pile or battlefield, and moved freely while on the battlefield. All text on the cards is also available for editing at any time, and this was the main feature missing from existing virtual tabletops for card games we had found.

## How does it work?

The website uses Blazor as its primary framework, incorporating C# into the normal HTML and CSS (+javascript) of a website. Player cards are saved in a database located on the server. Multiplayer functionality is handled by SignalR. Lastly, custom javascript is used to move the cards, accurately rescale the battlefield with window size without messing up the drag-and-drop controls, and handle moving cards between zones.

## How far along are we?

Most of the core functionality is present - players can log in, create cards, access a battlefield, and move cards on said battlefield. Multiplayer functionality and the final battlefield interface layout (deck, hand, discard, other players' battlefields) are fully planned but still not implemented yet.

## Using the Database with testing

The application is now set up to use SQLite as the DbContext, to use this for your own testing you will need to do a few things.
- First, make sure you have a .db file in the project folder. If you don't have one, you can create it by running the application and it will be generated automatically.
- Second, you will need to make sure that the appsettings connection string is set up to target your .db file. The default for this is OrbellionWebContext.db, but you can change it if you want
- Last, you will need to apply the migration that has already been created to the database. After completing the previous steps, apply the migration (you might need to install the dotnet ef tool).
	- If using Package Manager Console, Run the command `Update-Database`. 
	- If using bash, run the command `dotnet ef database update`.

This should be all you need to get the database working, I recommend using SQLite Browser to view the database for testing and whatnot.
