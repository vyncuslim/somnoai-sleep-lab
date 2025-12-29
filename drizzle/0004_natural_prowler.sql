CREATE TABLE `google_fit_sync_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncStartTime` timestamp NOT NULL,
	`syncEndTime` timestamp,
	`status` enum('pending','syncing','success','failed') NOT NULL DEFAULT 'pending',
	`recordsCount` int DEFAULT 0,
	`errorMessage` text,
	`errorCode` varchar(64),
	`syncDuration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_fit_sync_status_id` PRIMARY KEY(`id`)
);
