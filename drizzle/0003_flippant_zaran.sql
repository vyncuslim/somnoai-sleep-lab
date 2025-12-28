CREATE TABLE `ai_chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`message` text NOT NULL,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetSleepDuration` int NOT NULL DEFAULT 480,
	`targetDeepSleepPercentage` decimal(5,2) DEFAULT '15.00',
	`targetRemPercentage` decimal(5,2) DEFAULT '20.00',
	`targetSleepEfficiency` decimal(5,2) DEFAULT '85.00',
	`notifyWhenMissed` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sleep_goals_id` PRIMARY KEY(`id`),
	CONSTRAINT `sleep_goals_userId_unique` UNIQUE(`userId`)
);
