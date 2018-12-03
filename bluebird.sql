--Database: bluebird

--DROP DATABASE bluebird;

--CREATE SCHEMA projetobd;

CREATE TABLE projetobd.phone(
	mobile_phone varchar(20),
	landline varchar(20),
	ID SERIAL PRIMARY KEY
);

CREATE TABLE projetobd.user(
	ID SERIAL PRIMARY KEY,
	name varchar(100),
	password varchar(25), 
	email varchar(100),
	street varchar(100),
	number int,
	zip_code varchar(25),
	neighborhood varchar(100),
	ID_phone int,
	Foreign key (ID_phone)
	references projetobd.phone(ID)
);

CREATE TABLE projetobd.order(
	code SERIAL PRIMARY KEY,
	data date,
	ID_user int, 
	Foreign Key (ID_user)
	references projetobd.user(ID)
);

CREATE TABLE projetobd.product(
	ID int PRIMARY KEY, 
	name varchar(100),
	category varchar(100),
	stock_quantity int, 
	price double precision,
	img_path varchar(100)
);

CREATE TABLE projetobd.order_product(
	order_quantity int,
	ID_product int,
	ID_order int, 
	Foreign key (ID_product)
	references projetobd.product(ID),
	Foreign key (ID_order)
	references projetobd.order(code)
);


