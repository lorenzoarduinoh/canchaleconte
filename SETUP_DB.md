# Setup Supabase Database

To replace the mocked data with a real database, follow these steps:

1.  **Create a Supabase Project**: Go to [Supabase.com](https://supabase.com) and create a new project.

2.  **Get Credentials**:
    *   Go to Project Settings -> API.
    *   Copy the `Project URL` and `anon` public key.

3.  **Configure Environment Variables**:
    *   Open the `.env.local` file in your project root.
    *   Add the following lines (replace with your actual credentials):
        ```env
        NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
        ```

4.  **Create Tables**:
    *   Go to the **SQL Editor** in your Supabase dashboard.
    *   Open the file `db_schema.sql` in this project.
    *   Copy the entire content of `db_schema.sql` and paste it into the Supabase SQL Editor.
    *   Click **Run**.

5.  **Restart the App**:
    *   If your server is running, restart it (`npm run dev`).

Now your application will use the real database!
