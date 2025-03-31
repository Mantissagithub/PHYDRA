import subprocess
import json

def run_module(cmd, input_file=None, output_file=None):
    if input_file and output_file:
        with open(input_file, "r") as inp, open(output_file, "w") as out:
            process = subprocess.run(cmd, stdin=inp, stdout=out, stderr=subprocess.PIPE)
    elif input_file:
        with open(input_file, "r") as inp:
            process = subprocess.run(cmd, stdin=inp, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    elif output_file:
        with open(output_file, "w") as out:
            process = subprocess.run(cmd, stdout=out, stderr=subprocess.PIPE)
    else:
        process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    if process.returncode != 0:
        print(f"Error in {cmd[0]}: {process.stderr.decode()}")
    else:
        print(f"{cmd[0]} executed successfully!")

print("Running Priority Calculation Engine...")
run_module(["./priortiyCalculationEngine"], output_file="priority_output.json")

print("Running 3D Bin Packing...")
run_module(["./3dBinPakckingAlgo"], input_file="priority_output.json", output_file="bin_packing_output.json")

print("Running Waste Management...")
run_module(["./wasteManagement"], input_file="bin_packing_output.json", output_file="waste_output.json")

print("Running Retrieval Path Planning...")
run_module(["./retrievalPathPlanning"], input_file="waste_output.json", output_file="path_output.json")

print("\nExecution completed! Results saved in 'path_output.json'")
