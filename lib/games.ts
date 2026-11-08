export type Game = {
  slug: string;
  name: string;
  genre: string;
  blurb: string;
  status: "online" | "coming-soon" | "planned";
  serverInfo: string[];
};

export const games: Game[] = [
  {
    slug: "7-days-to-die",
    name: "7 Days to Die",
    genre: "Survival Horror",
    blurb: "Blood moon survival with a chaotic crew. Discord hub is open - the server launches with the community.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Want input on server rules and rates? Join the Discord",
    ],
  },
  {
    slug: "ark",
    name: "ARK: Survival Evolved",
    genre: "Survival",
    blurb: "Tame, build, conquer. Discord hub is open - server plans forming with the founding crew.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - map and rates voted on by members",
      "Founding members get first say on server settings",
    ],
  },
  {
    slug: "atlas",
    name: "ATLAS",
    genre: "Pirates",
    blurb: "Sail, raid, and build empires across the open seas. Community hub forming.",
    status: "coming-soon",
    serverInfo: [
      "Discord hub open now",
      "Server under consideration - show interest in Discord to help it happen",
    ],
  },
  {
    slug: "soulmask",
    name: "Soulmask",
    genre: "Survival",
    blurb: "Tribal survival with masks, mounts, and a chaotic crew. Discord hub is open - the server launches with the community.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Want input on server rules and rates? Join the Discord",
    ],
  },
  {
    slug: "space-engineers",
    name: "Space Engineers",
    genre: "Space Survival",
    blurb: "Build ships, stations, and chaos in space. Discord hub is open - server plans forming with the founding crew.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Founding members get first say on server settings",
    ],
  },
  {
    slug: "palworld",
    name: "Palworld",
    genre: "Survival",
    blurb: "Catch, build, and survive with Pals at your side. Discord hub is open - the server launches with the community.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Want input on server rules and rates? Join the Discord",
    ],
  },
  {
    slug: "icarus",
    name: "Icarus",
    genre: "Survival",
    blurb: "Drop in, survive, and get out — prospecting with a chaotic crew. Discord hub is open - the server launches with the community.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Want input on server rules and rates? Join the Discord",
    ],
  },
  {
    slug: "valheim",
    name: "Valheim",
    genre: "Survival",
    blurb: "Viking survival, boss fights, and longship chaos. Discord hub is open - server plans forming with the founding crew.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Founding members get first say on server settings",
    ],
  },
  {
    slug: "minecraft",
    name: "Minecraft",
    genre: "Sandbox Survival",
    blurb: "Build, explore, and survive together, block by block. Discord hub is open - the server launches with the community.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Want input on server rules and rates? Join the Discord",
    ],
  },
  {
    slug: "conan-exiles",
    name: "Conan Exiles",
    genre: "Survival",
    blurb: "Survive, build, and conquer in the Exiled Lands. Discord hub is open - server plans forming with the founding crew.",
    status: "planned",
    serverInfo: [
      "Discord hub open now: LFG, tips, and community chat",
      "Game server planned - settings will be voted on by members",
      "Founding members get first say on server settings",
    ],
  },
];

export const statusLabel: Record<Game["status"], string> = {
  online: "SERVER ONLINE",
  "coming-soon": "COMING SOON",
  planned: "HUB OPEN - SERVER PLANNED",
};
