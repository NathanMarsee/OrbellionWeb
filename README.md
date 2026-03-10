# OrbellionWeb

## Using the Database with testing

The application is now set up to use SQLite as the DbContext, to use this for your own testing you will need to do a few things.
- First, make sure you have a .db file in the project folder. If you don't have one, you can create it by running the application and it will be generated automatically.
- Second, you will need to make sure that the appsettings connection string is set up to target your .db file. The default for this is OrbellionWebContext.db, but you can change it if you want
- Last, you will need to apply the migration that has already been created to the database. After completing the previous steps, apply the migration (you might need to install the dotnet ef tool).
	- If using Package Manager Console, Run the command `Update-Database`. 
	- If using bash, run the command `dotnet ef database update`.

This should be all you need to get the database working, I recommend using SQLite Browser to view the database for testing and whatnot.