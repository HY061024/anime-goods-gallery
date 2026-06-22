


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."increment_cabinet_views"("target_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    UPDATE profiles SET cabinet_views = cabinet_views + 1 WHERE user_id =
  target_user_id;
  END;
  $$;


ALTER FUNCTION "public"."increment_cabinet_views"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_notifications" (
    "id" bigint NOT NULL,
    "item_id" integer,
    "item_title" "text" DEFAULT ''::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."admin_notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."admin_notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."admin_notifications_id_seq" OWNED BY "public"."admin_notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "admins_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "email" "text" DEFAULT ''::"text",
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."feedback_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."feedback_id_seq" OWNED BY "public"."feedback"."id";



CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" bigint NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."friendships_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."friendships_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."friendships_id_seq" OWNED BY "public"."friendships"."id";



CREATE TABLE IF NOT EXISTS "public"."import_candidates" (
    "id" bigint NOT NULL,
    "job_id" bigint,
    "user_id" "uuid",
    "title" "text",
    "description" "text",
    "image_urls" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "source_url" "text",
    "source_platform" "text",
    "confidence" numeric,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."import_candidates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."import_candidates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."import_candidates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."import_candidates_id_seq" OWNED BY "public"."import_candidates"."id";



CREATE TABLE IF NOT EXISTS "public"."import_jobs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "source_url" "text",
    "source_platform" "text",
    "import_type" "text" DEFAULT 'link'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."import_jobs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."import_jobs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."import_jobs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."import_jobs_id_seq" OWNED BY "public"."import_jobs"."id";



CREATE TABLE IF NOT EXISTS "public"."inspiration_comments" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inspiration_comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inspiration_comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inspiration_comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inspiration_comments_id_seq" OWNED BY "public"."inspiration_comments"."id";



CREATE TABLE IF NOT EXISTS "public"."inspiration_favorites" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inspiration_favorites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inspiration_favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inspiration_favorites_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inspiration_favorites_id_seq" OWNED BY "public"."inspiration_favorites"."id";



CREATE TABLE IF NOT EXISTS "public"."inspiration_likes" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inspiration_likes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inspiration_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inspiration_likes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inspiration_likes_id_seq" OWNED BY "public"."inspiration_likes"."id";



CREATE TABLE IF NOT EXISTS "public"."inspiration_posts" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "cover_url" "text",
    "video_url" "text",
    "material_url" "text",
    "work" "text" DEFAULT ''::"text",
    "character" "text" DEFAULT ''::"text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "related_item_id" integer,
    "visibility" "text" DEFAULT 'public'::"text" NOT NULL,
    "like_count" integer DEFAULT 0 NOT NULL,
    "comment_count" integer DEFAULT 0 NOT NULL,
    "favorite_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "inspiration_posts_type_check" CHECK (("type" = ANY (ARRAY['video'::"text", 'note'::"text", 'material'::"text", 'question'::"text"]))),
    CONSTRAINT "inspiration_posts_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."inspiration_posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inspiration_posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inspiration_posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inspiration_posts_id_seq" OWNED BY "public"."inspiration_posts"."id";



CREATE TABLE IF NOT EXISTS "public"."item_images" (
    "id" bigint NOT NULL,
    "item_id" integer NOT NULL,
    "image_type" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "submitter_id" "uuid",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "item_images_image_type_check" CHECK (("image_type" = ANY (ARRAY['official'::"text", 'real'::"text"])))
);


ALTER TABLE "public"."item_images" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."item_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."item_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."item_images_id_seq" OWNED BY "public"."item_images"."id";



CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "work" "text" NOT NULL,
    "character" "text" NOT NULL,
    "category" "text" NOT NULL,
    "price" numeric NOT NULL,
    "description" "text" NOT NULL,
    "image" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "submitter_id" "uuid",
    "visibility" "text" DEFAULT 'public'::"text" NOT NULL,
    "official_image_url" "text",
    "real_image_url" "text",
    "official_image_submitter_id" "uuid",
    "real_image_submitter_id" "uuid",
    "official_image_created_at" timestamp with time zone,
    "real_image_created_at" timestamp with time zone,
    "source_url" "text",
    "source_platform" "text",
    CONSTRAINT "items_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."items" OWNER TO "postgres";


ALTER TABLE "public"."items" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" bigint NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."messages_id_seq" OWNED BY "public"."messages"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" integer,
    "item_title" "text" DEFAULT ''::"text" NOT NULL,
    "type" "text" NOT NULL,
    "message" "text" DEFAULT ''::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['submission_approved'::"text", 'submission_rejected'::"text", 'delete_approved'::"text", 'd
  elete_rejected'::"text", 'friend_request'::"text", 'friend_accepted'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "cabinet_public" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cabinet_views" integer DEFAULT 0 NOT NULL,
    "avatar_url" "text",
    "bio" "text" DEFAULT ''::"text",
    "banner_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_collections" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" integer NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_collections" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_collections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_collections_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_collections_id_seq" OWNED BY "public"."user_collections"."id";



ALTER TABLE ONLY "public"."admin_notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."admin_notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."feedback" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."feedback_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."friendships" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."friendships_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."import_candidates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."import_candidates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."import_jobs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."import_jobs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inspiration_comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inspiration_comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inspiration_favorites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inspiration_favorites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inspiration_likes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inspiration_likes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inspiration_posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inspiration_posts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."item_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."item_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_collections" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_collections_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_sender_id_receiver_id_key" UNIQUE ("sender_id", "receiver_id");



ALTER TABLE ONLY "public"."import_candidates"
    ADD CONSTRAINT "import_candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."import_jobs"
    ADD CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspiration_comments"
    ADD CONSTRAINT "inspiration_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspiration_favorites"
    ADD CONSTRAINT "inspiration_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspiration_favorites"
    ADD CONSTRAINT "inspiration_favorites_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."inspiration_likes"
    ADD CONSTRAINT "inspiration_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspiration_likes"
    ADD CONSTRAINT "inspiration_likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."inspiration_posts"
    ADD CONSTRAINT "inspiration_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_images"
    ADD CONSTRAINT "item_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "user_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "user_collections_user_id_item_id_key" UNIQUE ("user_id", "item_id");



CREATE INDEX "idx_collections_user" ON "public"."user_collections" USING "btree" ("user_id");



CREATE INDEX "idx_friendships_receiver" ON "public"."friendships" USING "btree" ("receiver_id", "status");



CREATE INDEX "idx_friendships_sender" ON "public"."friendships" USING "btree" ("sender_id", "status");



CREATE INDEX "idx_ic_post" ON "public"."inspiration_comments" USING "btree" ("post_id", "created_at");



CREATE INDEX "idx_if_post" ON "public"."inspiration_favorites" USING "btree" ("post_id");



CREATE INDEX "idx_if_user" ON "public"."inspiration_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_ii_item" ON "public"."item_images" USING "btree" ("item_id", "image_type", "sort_order");



CREATE INDEX "idx_il_post" ON "public"."inspiration_likes" USING "btree" ("post_id");



CREATE INDEX "idx_il_user" ON "public"."inspiration_likes" USING "btree" ("user_id");



CREATE INDEX "idx_ip_type" ON "public"."inspiration_posts" USING "btree" ("type", "created_at" DESC);



CREATE INDEX "idx_ip_user" ON "public"."inspiration_posts" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_ip_visible" ON "public"."inspiration_posts" USING "btree" ("visibility", "created_at" DESC);



CREATE INDEX "idx_ip_work" ON "public"."inspiration_posts" USING "btree" ("work");



CREATE INDEX "idx_items_official_submitter" ON "public"."items" USING "btree" ("official_image_submitter_id");



CREATE INDEX "idx_items_real_submitter" ON "public"."items" USING "btree" ("real_image_submitter_id");



CREATE INDEX "idx_items_submitter_id" ON "public"."items" USING "btree" ("submitter_id");



CREATE INDEX "idx_messages_thread" ON "public"."messages" USING "btree" (LEAST("sender_id", "receiver_id"), GREATEST("sender_id", "receiver_id"), "created_at" DESC);



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."import_candidates"
    ADD CONSTRAINT "import_candidates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."import_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."import_candidates"
    ADD CONSTRAINT "import_candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."import_jobs"
    ADD CONSTRAINT "import_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inspiration_comments"
    ADD CONSTRAINT "inspiration_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."inspiration_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_comments"
    ADD CONSTRAINT "inspiration_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_favorites"
    ADD CONSTRAINT "inspiration_favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."inspiration_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_favorites"
    ADD CONSTRAINT "inspiration_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_likes"
    ADD CONSTRAINT "inspiration_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."inspiration_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_likes"
    ADD CONSTRAINT "inspiration_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspiration_posts"
    ADD CONSTRAINT "inspiration_posts_related_item_id_fkey" FOREIGN KEY ("related_item_id") REFERENCES "public"."items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inspiration_posts"
    ADD CONSTRAINT "inspiration_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_images"
    ADD CONSTRAINT "item_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_images"
    ADD CONSTRAINT "item_images_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_official_image_submitter_id_fkey" FOREIGN KEY ("official_image_submitter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_real_image_submitter_id_fkey" FOREIGN KEY ("real_image_submitter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "user_collections_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_collections"
    ADD CONSTRAINT "user_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read comments" ON "public"."inspiration_comments" FOR SELECT USING (true);



CREATE POLICY "Anyone can read favorites" ON "public"."inspiration_favorites" FOR SELECT USING (true);



CREATE POLICY "Anyone can read item_images" ON "public"."item_images" FOR SELECT USING (true);



CREATE POLICY "Anyone can read items" ON "public"."items" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can read likes" ON "public"."inspiration_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can read public posts" ON "public"."inspiration_posts" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Anyone can read public profiles" ON "public"."profiles" FOR SELECT USING (("cabinet_public" = true));



CREATE POLICY "Authenticated users can insert item_images" ON "public"."item_images" FOR INSERT WITH CHECK (("auth"."uid"() = "submitter_id"));



CREATE POLICY "Users can create comments" ON "public"."inspiration_comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create posts" ON "public"."inspiration_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own comments" ON "public"."inspiration_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own import_candidates" ON "public"."import_candidates" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete own item_images" ON "public"."item_images" FOR DELETE USING (("auth"."uid"() = "submitter_id"));



CREATE POLICY "Users can delete own posts" ON "public"."inspiration_posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own import_candidates" ON "public"."import_candidates" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert own import_jobs" ON "public"."import_jobs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can manage own favorites" ON "public"."inspiration_favorites" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own likes" ON "public"."inspiration_likes" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own posts" ON "public"."inspiration_posts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own import_candidates" ON "public"."import_candidates" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own import_jobs" ON "public"."import_jobs" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own posts" ON "public"."inspiration_posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own import_candidates" ON "public"."import_candidates" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own import_jobs" ON "public"."import_jobs" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage own collections" ON "public"."user_collections" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own profile" ON "public"."profiles" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admin_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."import_candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."import_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspiration_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspiration_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspiration_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inspiration_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_collections" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."increment_cabinet_views"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_cabinet_views"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_cabinet_views"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_notifications" TO "anon";
GRANT ALL ON TABLE "public"."admin_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admin_notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";



GRANT ALL ON SEQUENCE "public"."friendships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friendships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friendships_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."import_candidates" TO "anon";
GRANT ALL ON TABLE "public"."import_candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."import_candidates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."import_candidates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."import_candidates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."import_candidates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."import_jobs" TO "anon";
GRANT ALL ON TABLE "public"."import_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."import_jobs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."import_jobs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."import_jobs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."import_jobs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inspiration_comments" TO "anon";
GRANT ALL ON TABLE "public"."inspiration_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."inspiration_comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inspiration_comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inspiration_comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inspiration_comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inspiration_favorites" TO "anon";
GRANT ALL ON TABLE "public"."inspiration_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."inspiration_favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inspiration_favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inspiration_favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inspiration_favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inspiration_likes" TO "anon";
GRANT ALL ON TABLE "public"."inspiration_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."inspiration_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inspiration_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inspiration_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inspiration_likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inspiration_posts" TO "anon";
GRANT ALL ON TABLE "public"."inspiration_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."inspiration_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inspiration_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inspiration_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inspiration_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."item_images" TO "anon";
GRANT ALL ON TABLE "public"."item_images" TO "authenticated";
GRANT ALL ON TABLE "public"."item_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."item_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."item_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."item_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_collections" TO "anon";
GRANT ALL ON TABLE "public"."user_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_collections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_collections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_collections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_collections_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































