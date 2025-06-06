import pandas as pd
import json
import numpy as np
from collections import defaultdict
import argparse
import sys
import re
import logging
import subprocess

"""
Excel to JSON Converter for Course Evaluations
Author: Gabriel Dall'Alba
Creation Date: 22-05-2025
Last Modification: 05-06-2025
Libraries that must be included in the Conda environment: pandas, numpy
Usage: python script.py -i input.xlsx -o output.json
Description: This script reads an Excel file containing course evaluations and comments,
              processes the data, and outputs it as a JSON file with a specific structure
              for my own website. It is quite obvious I'm having some fun here.
"""

# want to create JSON with the following structure:
# {
#   "courses": [
#     {
#       "id": "course_id",
#       "name": "course_name",
#       "years": [year1, year2, ...],
#       "role": "role",
#       "evaluations": [
#         {
#           "year": year,
#           "term": "term",
#           "metrics": {
#             "metric_name": {
#               "SD": 0,
#               "D": 0,
#               "N": 0,
#               "A": 0,
#               "SA": 0,
#               "n": 0,
#               "question": "full question"
#             },
#             ...
#           },
#           "comments": [
#             "comment1",
#             "comment2",
#             ...
#           ]
#         },
#         ...
#       ]
#     },
#     ...
#   ]
#}

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('convert_excel_to_json.log')
    ]
)
logger = logging.getLogger(__name__)

def print_header():
    """Prints a header for fun."""
    header = """
    ============================================================
    Excel to JSON Converter for Course Evaluations
    Author: Gabriel Dall'Alba
    Creation Date: 22-05-2025
    Last Modification: 05-06-2025
    This script reads an Excel file containing course evaluations and comments,
    processes the data, and outputs it as a JSON file with a specific structure
    for my own website. It is quite obvious I'm having some fun here.
    version: 1.0
    Libraries required: pandas, numpy
    ============================================================
    """
    print(header)

def parse_arguments():
    """Parse command line arguments."""   
    parser = argparse.ArgumentParser(description="Convert Excel course evaluations to JSON format.")
    parser.add_argument("-i", "--input", required=True, help="Input Excel file path")
    parser.add_argument("-o", "--output", required=True, help="Output JSON file path")    
    parser.add_argument("-c", "--conda_env", required=True, help='Conda environment name')
    return parser.parse_args()

def validate_inputs(input_file: str, output_file: str) -> str:
    """Validate input and output file paths."""
    logger.info("Validating input and output file paths...")
    print("Validating input and output file paths...")
    if not input_file.endswith('.xlsx'):
        logger.error("Input file must be an Excel file (.xlsx). Assuming you chose the wrong file, will exit now.")
        sys.exit(1)
    if not output_file.endswith('.json'):
        logger.error("Output file must be a JSON file (.json). Assuming you forgot to specify the extension, will append now.")
        output_file += '.json'
        print(f"Output file will be saved as {output_file}")        
    if not pd.ExcelFile(input_file).sheet_names:
        logger.error("Input Excel file is empty or does not contain any sheets. Please double-check your input. Will exit now.")
        sys.exit(1)

    return output_file


def setup_conda_environment(env_name: str) -> bool:
    """Check if conda environment exists, activate it if it does, or create it if it doesn't."""    
    logger.info(f"Checking if conda environment '{env_name}' exists...")
    print(f"Checking if conda environment '{env_name}'...")
    
    try:
        # Check if conda is installed
        subprocess.run(['conda', '--version'], check=True, stdout=subprocess.PIPE, shell=True)

        # List all conda environments
        env_list = subprocess.run(['conda', 'env', 'list'], 
                                  check=True, 
                                  stdout=subprocess.PIPE, shell=True).stdout.decode()

        # Check if our environment exists
        if env_name in env_list:
            logger.info(f"Conda environment '{env_name}' found. Activating...")
            print(f"Conda environment '{env_name}' found. Activating...")
            return True
        else:
            logger.info(f"Conda environment '{env_name}' not found. Creating it with required packages...")
            print(f"Conda environment '{env_name}' not found. Creating it with required packages...")
            
            # Create the environment with required packages
            subprocess.run(
                ['conda', 'create', '-y', '-n', env_name, 'pandas', 'numpy'], 
                check=True, 
                stdout=subprocess.PIPE, 
                shell=True
            )
            logger.info(f"Conda environment '{env_name}' created successfully.")
            print(f"Conda environment '{env_name}' created successfully.")
            return True
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Error setting up conda environment: {e}")
        print(f"Error setting up conda environment: {e}. Please ensure conda is installed.")
        return False

def normalize_metric(question):
    # get the last 3-4 words as key, simplified for clarity
    q = question.strip().lower()
    key = re.sub(r"[^a-z0-9_ ]", "", q[-50:])  # remove punctuation with regex
    key = "_".join(key.split()[-3:]) + "."
    return key

# run through NaN values, replace with 0 for safety
def safe_int(value, default=0):
    if pd.isna(value) or np.isnan(value):
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def process_excel_into_json(input_file: str, output_file: str) -> None:
    """
    This function is a placeholder for any future file retrieval logic.    
    """    
    xls = pd.ExcelFile("evaluations.xlsx")

    df_courses = xls.parse("Courses")
    df_ta = xls.parse("Evaluations_TA")
    df_lecturer = xls.parse("Evaluations_Lecturer")
    df_comments = xls.parse("Comments")

    evaluations_by_course = defaultdict(lambda: {"metrics": {}, "comments": []})

    # iterate through all types of data we want to add to json
    # pass a dict with course_id, year, term as key
    # and a list of metrics and comments as value


    for _, row in df_ta.iterrows(): # df.iterrows returns both index and data, _ tells us to ignore index
        key = (row["Course ID"], int(row["Year"]), row["Term"])
        metric_name = normalize_metric(row["Question"])
        
        evaluations_by_course[key]["metrics"][metric_name] = {
            "SD": safe_int(row.get("SD", 0)),
            "D": safe_int(row.get("D", 0)), 
            "N": safe_int(row.get("N", 0)),
            "A": safe_int(row.get("A", 0)),
            "SA": safe_int(row.get("SA", 0)),
            "n": safe_int(row.get("n", 0)),
            "question": row["Question"]  # full question
        }

    for _, row in df_lecturer.iterrows():
        key = (row["Course ID"], int(row["Year"]), row["Term"])
        metric_name = normalize_metric(row["Question"])
        
        evaluations_by_course[key]["metrics"][metric_name] = {
            "SD": safe_int(row.get("SD", 0)),
            "D": safe_int(row.get("D", 0)), 
            "N": safe_int(row.get("N", 0)),
            "A": safe_int(row.get("A", 0)),
            "SA": safe_int(row.get("SA", 0)),
            "n": safe_int(row.get("n", 0)),
            "question": row["Question"] 
        }

    for _, row in df_comments.iterrows():
        key = (row["Course ID"], int(row["Year"]), row["Term"])
        if isinstance(row["Comment"], str) and not pd.isna(row["Comment"]):
            evaluations_by_course[key]["comments"].append(row["Comment"].strip())

    courses_out = [] # list to hold the final course data

    for _, row in df_courses.iterrows():
        course_id = row["ID"]
        name = f"{course_id} - {row['Course Name']}"
        role = row["Role"]
        
        years_str = str(row["Years"]) if not pd.isna(row["Years"]) else ""
        years = sorted([int(y.strip()) for y in years_str.split(",") if y.strip()])
        
        evaluations = []
        for (cid, year, term), eval_data in evaluations_by_course.items():
            if cid != course_id:
                continue
            evaluations.append({
                "year": year,
                "term": term,
                "metrics": eval_data["metrics"],
                "comments": eval_data["comments"]
            })

        courses_out.append({
            "id": course_id,
            "name": name,
            "years": years,
            "role": role,
            "evaluations": sorted(evaluations, key=lambda e: (e["year"], e["term"]))
        })

    output = {"courses": courses_out}
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)

    print("JSON file written to", output_file)

def main():
    try:
        print_header()
        args = parse_arguments()
        output_file = validate_inputs(args.input, args.output)

        if setup_conda_environment(args.conda_env):
            process_excel_into_json(args.input, output_file)
            logger.info("Processing completed successfully.")
            print("Processing completed successfully. Check the log file for details.")
        else:
            logger.error("Failed to set up conda environment. Exiting.")
            print("Failed to set up conda environment. Exiting.")
            sys.exit(1)            
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        print(f"An error occurred: {e}. Check the log file for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()