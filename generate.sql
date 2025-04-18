CREATE DATABASE data;
\c data;

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Debian 16.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bank.credit(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."bank.credit"(uuid uuid, amount integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE bank AS _bank SET balance = balance + $2 WHERE _bank.uuid = $1;

RETURN json_build_object('code', 0);

END;
$_$;


ALTER FUNCTION public."bank.credit"(uuid uuid, amount integer) OWNER TO postgres;

--
-- Name: bank.deduct(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."bank.deduct"(uuid uuid, amount integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE bank AS _bank SET balance = balance - $2 WHERE _bank.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."bank.deduct"(uuid uuid, amount integer) OWNER TO postgres;

--
-- Name: bank.resolve(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."bank.resolve"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

balance integer;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _bank.balance
  FROM bank AS _bank
  WHERE _bank.uuid = $1
)

SELECT data.balance
INTO balance
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'uuid', $1,
    'balance', balance
  )
);

END$_$;


ALTER FUNCTION public."bank.resolve"(uuid uuid) OWNER TO postgres;

--
-- Name: bank.transfer(uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."bank.transfer"(sender uuid, receiver uuid, amount integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $2 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 2); 
END IF;

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1
    AND _bank.balance >= 3
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 3); 
END IF;

UPDATE bank AS _bank SET balance = balance - $3 WHERE _bank.uuid = $1;
UPDATE bank AS _bank SET balance = balance + $3 WHERE _bank.uuid = $2;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."bank.transfer"(sender uuid, receiver uuid, amount integer) OWNER TO postgres;

--
-- Name: items.create(uuid, character varying, character varying, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.create"(uuid uuid, name character varying, description character varying, price integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

INSERT INTO items
VALUES ($1, $2, $3, $4);

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."items.create"(uuid uuid, name character varying, description character varying, price integer) OWNER TO postgres;

--
-- Name: items.delete(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.delete"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _items.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

DELETE FROM items as _items
WHERE _items.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."items.delete"(uuid uuid) OWNER TO postgres;

--
-- Name: items.list(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.list"() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE

items json;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT * FROM items
) SELECT json_agg(data) INTO items FROM data;

RETURN json_build_object(
  'code', 0,
  'items', items
) ;

END$$;


ALTER FUNCTION public."items.list"() OWNER TO postgres;

--
-- Name: items.redescribe(uuid, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.redescribe"(uuid uuid, description character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _items.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE items as _items
SET description = $2
WHERE _items.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."items.redescribe"(uuid uuid, description character varying) OWNER TO postgres;

--
-- Name: items.rename(uuid, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.rename"(uuid uuid, name character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _items.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE items AS _items
SET name = $2
WHERE _items.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."items.rename"(uuid uuid, name character varying) OWNER TO postgres;

--
-- Name: items.reprice(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.reprice"(uuid uuid, price integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _items.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE items AS _items
SET price = $2
WHERE _items.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."items.reprice"(uuid uuid, price integer) OWNER TO postgres;

--
-- Name: items.resolve(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."items.resolve"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

name varchar(64);
description varchar(512);
price integer;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _items.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _items.name, _items.description, _items.price
  FROM items AS _items
  WHERE _items.uuid = $1
)

SELECT data.name, data.description, data.price
INTO name, description, price
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'uuid', $1,
    'name', name,
    'description', description,
    'price', price
  )
);

END$_$;


ALTER FUNCTION public."items.resolve"(uuid uuid) OWNER TO postgres;

--
-- Name: transactions.add(uuid, uuid, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."transactions.add"(uuid uuid, tid uuid, items character varying, comment character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

INSERT INTO transactions
VALUES ($1, $2, $3);

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."transactions.add"(uuid uuid, tid uuid, items character varying, comment character varying) OWNER TO postgres;

--
-- Name: transactions.list(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."transactions.list"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

transactions json;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _transactions.uuid, _transactions.tid, _transactions.items, _transactions.comment, _transactions.timestamp FROM transactions AS _transactions WHERE _transactions.uuid = $1
) SELECT json_agg(data) INTO transactions FROM data;

RETURN json_build_object(
  'code', 0,
  'transactions', transactions
) ;

END$_$;


ALTER FUNCTION public."transactions.list"(uuid uuid) OWNER TO postgres;

--
-- Name: transactions.resolve(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."transactions.resolve"(tid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

uuid uuid;
tid uuid;
items varchar(65536);
comment varchar(512);
timestamp timestamp;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM items AS _items 
    WHERE _bank.tid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _transactions.uuid, _transactions.tid, _transactions.items, _transactions.comment, _transactions.timestamp 
  FROM transactions AS _transactions
  WHERE _transactions.tid = $1
)

SELECT data.uuid, data.tid, data.items, data.comment, data.timestamp
INTO uuid, tid, items, comment, timestamp
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'uuid', uuid,
    'tid', tid,
    'items', items,
    'comment', comment,
    'timestamp', timestamp
  ) 
);

END$_$;


ALTER FUNCTION public."transactions.resolve"(tid uuid) OWNER TO postgres;

--
-- Name: user.create(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.create"(uuid uuid, id text, email text, hash text) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT true 
  FROM bank AS _bank
  WHERE _bank.uuid = $1
  LIMIT 1
)
THEN 
  RETURN json_build_object('code', 1);
END IF;

IF (
  SELECT true 
  FROM users AS _users
  WHERE _users.id = $2
  LIMIT 1
)
THEN 
  RETURN json_build_object('code', 2);
END IF;

IF (
  SELECT true 
  FROM users AS _users
  WHERE _users.handle = $3
  LIMIT 1
)
THEN 
  RETURN json_build_object('code', 3);
END IF;

INSERT INTO users ("uuid", "id", "email", "hash")
VALUES ($1, $2, $3, $4);

INSERT INTO bank ("uuid")
VALUES ($1);

RETURN json_build_object('code', 0);

END;
$_$;


ALTER FUNCTION public."user.create"(uuid uuid, id text, email text, hash text) OWNER TO postgres;

--
-- Name: user.delete(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.delete"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;
DELETE FROM bank AS _bank
WHERE _bank.uuid = $1;

DELETE FROM users AS _users
WHERE _users.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."user.delete"(uuid uuid) OWNER TO postgres;

--
-- Name: user.hash(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.hash"(email text) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

hash text;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM users AS _users
    WHERE _users.email = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _users.hash
  FROM users AS _users
  WHERE _users.email = $1
)

SELECT data.hash
INTO hash
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'hash', hash
  )
);

END$_$;


ALTER FUNCTION public."user.hash"(email text) OWNER TO postgres;

--
-- Name: user.list(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.list"() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE

users json;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM users AS _users
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT uuid, id, email, rank, created FROM users
) SELECT json_agg(data) INTO users FROM data;

RETURN json_build_object(
  'code', 0,
  'users', users
) ;

END$$;


ALTER FUNCTION public."user.list"() OWNER TO postgres;

--
-- Name: user.rank(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.rank"(uuid uuid, rank integer) RETURNS json
    LANGUAGE plpgsql
    AS $_$
BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

UPDATE users as _users
SET rank = $2
WHERE _users.uuid = $1;

RETURN json_build_object('code', 0);

END$_$;


ALTER FUNCTION public."user.rank"(uuid uuid, rank integer) OWNER TO postgres;

--
-- Name: user.resolve(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.resolve"(uuid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

id text;
email text;
rank integer;
created timestamp;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM bank AS _bank 
    WHERE _bank.uuid = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _users.id, _users.email, _users.rank, _users.created
  FROM users AS _users
  WHERE _users.uuid = $1
)

SELECT data.id, data.email, data.rank, data.created
INTO id, email, rank, created
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'uuid', $1,
    'id', id,
    'email', email,
    'rank', rank,
    'created', created
  )
);

END$_$;


ALTER FUNCTION public."user.resolve"(uuid uuid) OWNER TO postgres;

--
-- Name: user.uuid(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."user.uuid"(email text) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE

uuid uuid;

BEGIN

IF (
  SELECT NOT EXISTS (
    SELECT true 
    FROM users AS _users
    WHERE _users.email = $1 
    LIMIT 1
  )
)
THEN
  RETURN json_build_object('code', 1); 
END IF;

WITH data AS (
  SELECT _users.uuid
  FROM users AS _users
  WHERE _users.email = $1
)

SELECT data.uuid
INTO uuid
FROM data;

RETURN json_build_object(
  'code', 0,
  'data', json_build_object(
    'uuid', uuid
  )
);

END$_$;


ALTER FUNCTION public."user.uuid"(email text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank (
    uuid uuid NOT NULL,
    balance integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.bank OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    uuid uuid NOT NULL,
    name character varying(64) NOT NULL,
    description character varying(512) NOT NULL,
    price integer NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    uuid uuid NOT NULL,
    tid uuid NOT NULL,
    items character varying(65536) NOT NULL,
    comment character varying(512),
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uuid uuid NOT NULL,
    id text NOT NULL,
    email text NOT NULL,
    hash text NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: items items_uuid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_uuid UNIQUE (uuid);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id UNIQUE (id);


--
-- Name: users users_uuid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid UNIQUE (uuid);


--
-- Name: bank uuid_bank; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank
    ADD CONSTRAINT uuid_bank UNIQUE (uuid);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: bank bank_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank
    ADD CONSTRAINT bank_uuid_fkey FOREIGN KEY (uuid) REFERENCES public.users(uuid) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: transactions transactions_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_uuid_fkey FOREIGN KEY (uuid) REFERENCES public.users(uuid) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

