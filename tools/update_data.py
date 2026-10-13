import csv
import json
import re
import os

def update_students_from_csv(csv_path, output_js="data.js", output_json="students.json"):
    """
    Skrip untuk mengemas kini senarai murid dari fail CSV pada bila-bila masa.
    Format lajur CSV: KELAS, NAMA, ID DELIMA, ID MURID, NO. KAD PENGENALAN, PASSWORD
    """
    students = []
    current_class = "UMUM"
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    row_count = 0
    for line in lines:
        line = line.strip()
        if not line or line.startswith("KELAS,") or "ID DELIMA" in line:
            continue
            
        parts = [p.strip() for p in line.split(',')]
        if len(parts) < 3:
            continue
            
        kelas_col = parts[0] if len(parts) > 0 else ""
        nama_col = parts[1] if len(parts) > 1 else ""
        id_delima_col = parts[2] if len(parts) > 2 else ""
        id_murid_col = parts[3] if len(parts) > 3 else ""
        no_kp_col = parts[4] if len(parts) > 4 else ""
        pwd_col = parts[5] if len(parts) > 5 else ""
        catatan_col = parts[6] if len(parts) > 6 else ""
        
        if kelas_col and (re.match(r'^[1-6]\s+[A-Za-z]+', kelas_col) or any(k in kelas_col for k in ["ILTIZAM", "JAYYID", "KHOIR", "MUMTAZ"])):
            current_class = kelas_col.strip()
            
        match_yr = re.search(r'([1-6])', current_class)
        year = int(match_yr.group(1)) if match_yr else 1
        
        nama = nama_col.strip()
        if not nama and id_delima_col and kelas_col:
            nama = kelas_col
            kelas = current_class
        else:
            kelas = current_class
            
        if not nama:
            continue
            
        row_count += 1
        student = {
            "id": row_count,
            "nama": nama,
            "kelas": kelas,
            "tahun": year,
            "id_delima": id_delima_col.strip(),
            "id_murid": id_murid_col.strip(),
            "no_kp": no_kp_col.strip(),
            "password": pwd_col.strip(),
            "catatan": catatan_col.strip() if catatan_col != "/" else ""
        }
        students.append(student)
        
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(students, f, indent=2, ensure_ascii=False)
        
    with open(output_js, 'w', encoding='utf-8') as f:
        f.write(f"// Senarai Data Murid DELIMa 3.0\n// Jumlah Murid: {len(students)}\nconst STUDENTS_DATA = {json.dumps(students, indent=2, ensure_ascii=False)};\n")
        
    print(f"Berjaya mengemas kini {len(students)} rekod murid ke dalam '{output_js}' dan '{output_json}'.")

if __name__ == "__main__":
    import sys
    csv_file = sys.argv[1] if len(sys.argv) > 1 else "murid_baru.csv"
    if os.path.exists(csv_file):
        update_students_from_csv(csv_file)
    else:
        print(f"Fail '{csv_file}' tidak dijumpai. Letakkan fail CSV dan jalankan: python3 tools/update_data.py nama_fail.csv")
