-- This is an empty migration.
create type sale_scope_type as enum ('ALL', 'PRODUCT', 'CATEGORY', 'RULE_BASED');
create type sale_rule_type as enum ('HIGH_STOCK', 'OLD_PRODUCT_DAYS', 'SPECIAL_DATE', 'USER_GENDER');
create type sale_operator as enum ('GTE', 'LTE', 'EQ', 'IN');

create table sale_campaigns (
	id serial primary key,
	name varchar(255) unique not null,
	discount_percent int not null check (discount_percent > 0 and discount_percent <= 100),
	created_at timestamp default current_timestamp,
	start_at timestamp not null,
	end_at timestamp not null,
	is_active boolean default true,
	scope_type sale_scope_type not null,
	check (end_at > start_at)
);

create table sale_rules (
	id serial primary key,
	campaign_id int not null,
	rule_type sale_rule_type not null,
	rule_operator sale_operator not null,
	rule_value varchar(255) not null,
	created_at timestamp default current_timestamp,
	
	constraint fk_rule_campaign
	foreign key (campaign_id)
	references sale_campaigns(id)
	on delete cascade
);