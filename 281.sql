
DROP DATABASE if exists `my_schema`;

CREATE DATABASE `my_schema`;

DROP TABLE IF EXISTS `my_schema`.`communities` ;

CREATE TABLE `my_schema`.`communities` ( 
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, 
    `community` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`id`)
);


DROP TABLE IF EXISTS `my_schema`.`users` ;

CREATE TABLE `my_schema`.`users` ( 
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, 
    `username` VARCHAR(20) NOT NULL, 
    `email` CHAR(60) NOT NULL,
    `password` CHAR(60) NOT NULL, 
    `community` VARCHAR(20) ,
	PRIMARY KEY (`id`), 
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), 
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) ,
    `is_admin` TINYINT(1) DEFAULT 0 NOT NULL
);


DROP TABLE IF EXISTS `my_schema`.`posts` ;

CREATE TABLE `my_schema`.`posts` ( 
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, 
    `username` VARCHAR(20) NOT NULL, 
    `imagepath` VARCHAR(200) NOT NULL, 
    `title` VARCHAR(40) NOT NULL, 
    `description` VARCHAR(40) NOT NULL, 
    `access` VARCHAR(40) NOT NULL, 
    `community` VARCHAR(20),
    PRIMARY KEY (`id`)
);


INSERT INTO `my_schema`.`communities`
(`id`,
`community`)
VALUES
(01,"AVALON"),
(02,"ALMEDA" );





    
