-- Sta toe dat we zonder inloggen data kunnen toevoegen en lezen (voor testen)
CREATE POLICY "Enable all access for anon users" ON patients FOR ALL TO anon USING (true);
CREATE POLICY "Enable all access for anon users" ON tasks FOR ALL TO anon USING (true);
CREATE POLICY "Enable all access for anon users" ON pipelines FOR ALL TO anon USING (true);
