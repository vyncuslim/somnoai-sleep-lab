CREATE TABLE `alarms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(255),
	`time` varchar(5) NOT NULL,
	`daysOfWeek` json,
	`isEnabled` int NOT NULL DEFAULT 1,
	`soundType` varchar(32) DEFAULT 'default',
	`vibration` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alarms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_fit_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`tokenExpiry` timestamp,
	`isConnected` int NOT NULL DEFAULT 1,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_fit_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heart_rate_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recordDate` timestamp NOT NULL,
	`averageHeartRate` int,
	`minHeartRate` int,
	`maxHeartRate` int,
	`restingHeartRate` int,
	`source` varchar(32) DEFAULT 'manual',
	`googleFitId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heart_rate_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recordDate` timestamp NOT NULL,
	`sleepScore` decimal(5,2),
	`totalDuration` int,
	`deepSleepDuration` int,
	`remDuration` int,
	`lightSleepDuration` int,
	`awakeDuration` int,
	`sleepEfficiency` decimal(5,2),
	`deepSleepPercentage` decimal(5,2),
	`remPercentage` decimal(5,2),
	`lightSleepPercentage` decimal(5,2),
	`awakePercentage` decimal(5,2),
	`source` varchar(32) DEFAULT 'manual',
	`googleFitId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sleep_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationsEnabled` int NOT NULL DEFAULT 1,
	`darkMode` int NOT NULL DEFAULT 1,
	`targetSleepDuration` int DEFAULT 480,
	`targetDeepSleepPercentage` decimal(5,2) DEFAULT '15.00',
	`timezone` varchar(64) DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
