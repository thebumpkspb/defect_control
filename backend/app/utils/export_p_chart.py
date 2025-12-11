from pypdf import PdfReader, PdfWriter
import json
import re
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import numpy as np
import matplotlib.pyplot as plt
import fitz
from PIL import Image
import openpyxl
from openpyxl.drawing.image import Image
import os
from typing import Dict

# import pythoncom
# import win32com.client
from openpyxl import load_workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import subprocess

from matplotlib import rcParams
from matplotlib.font_manager import FontProperties
import math

# Get the directory of the current .py file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to THSarabun.ttf
font_path = os.path.join(current_dir, "FreeSerif.ttf")

# Set up the Thai font
thai_font = FontProperties(fname=font_path)
rcParams["font.family"] = thai_font.get_name()


class Export_P_Chart_Utils:
    def __init__(self):
        pass

    def create_graph_as_image(
        self, image_path, data, title="Defect Analysis Bar Chart"
    ):
        """
        Generate a bar chart for defect analysis and save it as an image.
        """
        thai_font = FontProperties(fname=font_path)
        plt.rcParams["font.family"] = thai_font.get_name()

        if "defect_list" not in data or not data["defect_list"]:
            # print ( "No defect data available." )
            return

        defect_names = [d["defect_name"] for d in data["defect_list"]]
        # print(defect_names)
        defect_values = np.array([d["value"] for d in data["defect_list"]])
        x_labels = list(map(lambda x: str(int(float(x))), data.get("x_axis_value", [])))
        x_positions = np.arange(len(x_labels))

        # Left Y-axis limits
        plt.autoscale(axis="y")

        # Create the Matplotlib figure
        fig, ax1 = plt.subplots()

        width = 0.7
        bottom = np.zeros(len(x_positions))
        # Plot bars for defects
        for i, defect_name in enumerate(defect_names):
            ax1.bar(
                x_positions,
                defect_values[i],
                width=width,
                label=defect_name,
                bottom=bottom,
            )
            bottom += defect_values[i]

        ax1.set_xticks(x_positions)
        ax1.set_xticklabels(x_labels, rotation=45, ha="right")
        ax1.set_ylim([0, np.nanmax(bottom) + 10])

        ax2 = ax1.twinx()
        max_ucl_target_values = 0
        # Plot UCL Target Line
        if "ucl_target" in data and data["ucl_target"]:
            ucl_target_values = data["ucl_target"]
            max_ucl_target_values = max(ucl_target_values)
            ax2.plot(
                x_positions,
                ucl_target_values,
                color="red",
                linestyle="--",
                marker="o",
                markersize=4,
                label="UCL Target",
            )

        # Plot percent defect line
        if "percent_defect" in data and data["percent_defect"]:
            percent_defect_values = data["percent_defect"]
            ax2.plot(
                x_positions,
                percent_defect_values,
                color="blue",
                linestyle="-",
                marker="s",
                markersize=4,
                label="Percent Defect",
            )

        # Plot p-bar line
        if "p_bar" in data and data["p_bar"]:
            p_bar_values = data["p_bar"]
            ax2.plot(
                x_positions,
                p_bar_values,
                color="green",
                linestyle="-.",
                marker="^",
                markersize=4,
                label="P-Bar",
            )

        ax2 = plt.gca()
        ax2.set_ylim([0, max_ucl_target_values + 1])

        # Legend handling
        # handles, labels = ax1.get_legend_handles_labels()
        handles1, labels1 = ax1.get_legend_handles_labels()
        handles2, labels2 = ax2.get_legend_handles_labels()
        handles = handles2 + handles1
        labels = labels2 + labels1
        n_items = len(labels)
        ncol = (n_items + 1) // 2  # rounds up for an odd number of items
        ax1.legend(
            handles,
            labels,
            prop=thai_font,
            fontsize=8,
            loc="upper center",
            bbox_to_anchor=(0.5, 1.22),  # ขยับตำแหน่ง legend ขึ้น (เพิ่มค่า y)
            ncol=ncol,
            frameon=True,  # เปิดกรอบรอบ legend
            facecolor="white",  # ตั้งค่าพื้นหลังเป็นสีขาว
            framealpha=1,  # ตั้งค่าความทึบของพื้นหลัง (1 = ทึบทั้งหมด)
            labelspacing=0.25,  # ลดระยะห่างระหว่างบรรทัดใน legend
        )
        # # --- DYNAMIC LEGEND ROWS HERE ---
        # handles, labels = ax1.get_legend_handles_labels()
        # n_items = len(labels)
        # max_items_per_row = 7  # Set how many items max per legend row
        # ncol = min(max_items_per_row, max(1, n_items))

        # ax1.legend(
        #     handles,
        #     labels,
        #     prop=thai_font,
        #     fontsize=8,
        #     loc="upper center",
        #     bbox_to_anchor=(0.5, 1.22),  # Move legend above plot
        #     ncol=ncol,  # Dynamic columns for multiple rows!
        #     frameon=True,
        #     facecolor="white",
        #     framealpha=1,
        #     labelspacing=0.25,
        # )
        # # --- END LEGEND SECTION ---

        ax1.set_ylabel("Q'ty pcs.", fontsize=8)
        ax2.set_ylabel("Defect ratio (%)", fontsize=8)

        fig.tight_layout()
        # Save graph as an image
        fig.set_size_inches(16, 3)
        plt.xticks(fontproperties=thai_font)  # Set font for X-axis tick labels
        plt.yticks(fontproperties=thai_font)  # Set font for Y-axis tick labels
        # plt.legend(prop=thai_font, fontsize=8)
        fig.savefig(image_path, dpi=140)
        plt.close(fig)
        # print ( f"Graph saved as image: {image_path}" )

    # def create_graph_as_image(
    #     self, image_path, data, title="Defect Analysis Bar Chart"
    # ):
    #     """
    #     Generate a bar chart for defect analysis and save it as an image.
    #     """
    #     thai_font = FontProperties(fname=font_path)
    #     plt.rcParams["font.family"] = thai_font.get_name()

    #     if "defect_list" not in data or not data["defect_list"]:
    #         return

    #     defect_names = [d["defect_name"] for d in data["defect_list"]]
    #     defect_values = np.array([d["value"] for d in data["defect_list"]])
    #     x_labels = list(map(lambda x: str(int(float(x))), data.get("x_axis_value", [])))
    #     x_positions = np.arange(len(x_labels))

    #     fig, ax1 = plt.subplots()
    #     width = 0.7
    #     bottom = np.zeros(len(x_positions))

    #     # Plot stacked bars for each defect
    #     for i, defect_name in enumerate(defect_names):
    #         ax1.bar(
    #             x_positions,
    #             defect_values[i],
    #             width=width,
    #             label=defect_name,
    #             bottom=bottom,
    #         )
    #         bottom += defect_values[i]

    #     ax1.set_xticks(x_positions)
    #     ax1.set_xticklabels(x_labels, rotation=45, ha="right")
    #     ax1.set_ylim([0, np.nanmax(bottom) + 10])

    #     ax2 = ax1.twinx()
    #     max_ucl_target_values = 0

    #     # Plot UCL Target Line
    #     if "ucl_target" in data and data["ucl_target"]:
    #         ucl_target_values = data["ucl_target"]
    #         max_ucl_target_values = max(ucl_target_values)
    #         ax2.plot(
    #             x_positions,
    #             ucl_target_values,
    #             color="red",
    #             linestyle="--",
    #             marker="o",
    #             markersize=4,
    #             label="UCL Target",
    #         )

    #     # Plot percent defect line
    #     if "percent_defect" in data and data["percent_defect"]:
    #         percent_defect_values = data["percent_defect"]
    #         ax2.plot(
    #             x_positions,
    #             percent_defect_values,
    #             color="blue",
    #             linestyle="-",
    #             marker="s",
    #             markersize=4,
    #             label="Percent Defect",
    #         )

    #     # Plot p-bar line
    #     if "p_bar" in data and data["p_bar"]:
    #         p_bar_values = data["p_bar"]
    #         ax2.plot(
    #             x_positions,
    #             p_bar_values,
    #             color="green",
    #             linestyle="-.",
    #             marker="^",
    #             markersize=4,
    #             label="P-Bar",
    #         )

    #     ax2.set_ylim([0, max_ucl_target_values + 1])

    #     # --- Dynamic legend rows and vertical space ---
    #     handles, labels = ax1.get_legend_handles_labels()
    #     n_items = len(labels)
    #     max_items_per_row = 7
    #     ncol = min(max_items_per_row, max(1, n_items))
    #     nrow = math.ceil(n_items / ncol)

    #     # Calculate top margin and legend vertical offset dynamically
    #     # The more rows, the more space needed
    #     # These values may be tuned based on your figure aspect ratio and text size
    #     # The logic: as nrow increases, top margin is smaller (axes move lower)
    #     TOP_BASE = 0.78
    #     TOP_STEP = 0.07  # increase this if overlap happens for many rows
    #     legend_y = 1.11 + (nrow - 1) * 0.09  # raise legend higher per row

    #     fig.set_size_inches(
    #         16, 4 + 0.45 * (nrow - 1)
    #     )  # make figure taller for more legend rows
    #     fig.tight_layout()
    #     fig.subplots_adjust(
    #         top=max(0.40, TOP_BASE - TOP_STEP * (nrow - 1))
    #     )  # never let top < 0.40

    #     ax1.legend(
    #         handles,
    #         labels,
    #         prop=thai_font,
    #         fontsize=8,
    #         loc="upper center",
    #         bbox_to_anchor=(0.5, legend_y),  # legend_y increases with nrow
    #         ncol=ncol,
    #         frameon=True,
    #         facecolor="white",
    #         framealpha=1,
    #         labelspacing=0.25,
    #         columnspacing=1.2,
    #         borderaxespad=0.4,
    #     )

    #     ax1.set_ylabel("Q'ty pcs.", fontsize=8)
    #     ax2.set_ylabel("Defect ratio (%)", fontsize=8)

    #     plt.xticks(fontproperties=thai_font)
    #     plt.yticks(fontproperties=thai_font)
    #     fig.savefig(image_path, dpi=140, bbox_inches="tight")
    #     plt.close(fig)

    def convert_to_json_compatible_format(self, pchart_graph_str):
        """
        Converts the improperly formatted JSON-like string into a valid JSON string.
        """
        try:
            # Step 1: Replace `Defect_Graph(id=1, defect_name="..."` with JSON format
            pchart_graph_str = re.sub(
                r"Defect_Graph\(", "{", pchart_graph_str
            )  # Replace 'Defect_Graph(' with '{'
            pchart_graph_str = re.sub(
                r"\)", "}", pchart_graph_str
            )  # Replace closing ')' with '}'
            pchart_graph_str = re.sub(
                r"(\w+)=", r'"\1":', pchart_graph_str
            )  # Replace key=value with "key": value
            pchart_graph_str = pchart_graph_str.replace(
                "'", '"'
            )  # Convert single quotes to double quotes for JSON

            # Debug output
            # print ( f"Converted JSON: {pchart_graph_str [ :500 ]}" )  # Print first 500 chars for verification

            return pchart_graph_str
        except Exception as e:
            # print ( f"Error converting pchart_graph_str: {e}" )
            return "{}"

    def convert_excel_to_pdf(self, excel_path: str, pdf_path: str):
        """
        Converts an Excel file to PDF using LibreOffice in headless mode (Linux/Unix).

        Parameters:
          excel_path (str): Path to the Excel file to be converted.
          pdf_path (str): Desired path for the output PDF file.
        """
        # Ensure we are working with absolute paths
        excel_abs_path = os.path.abspath(excel_path)
        pdf_abs_path = os.path.abspath(pdf_path)
        output_dir = os.path.dirname(pdf_abs_path)

        # Build the LibreOffice command:
        # LibreOffice converts the file and saves it with the same base name but a .pdf extension.
        command = [
            "libreoffice",
            "--headless",
            "--convert-to",
            "pdf",
            excel_abs_path,
            "--outdir",
            output_dir,
        ]

        try:
            subprocess.run(command, check=True)
            # Determine the generated PDF path
            base_name = os.path.splitext(os.path.basename(excel_abs_path))[0]
            generated_pdf = os.path.join(output_dir, base_name + ".pdf")

            # If the generated PDF file name differs from the desired one, rename it
            if generated_pdf != pdf_abs_path:
                os.rename(generated_pdf, pdf_abs_path)

            # print(f"Converted {excel_path} to {pdf_path}")
        except subprocess.CalledProcessError as e:
            # print(f"Error converting Excel to PDF: {e}")
            pass
        except Exception as e:
            # print(f"An error occurred: {e}")
            pass

    def convert_defect_table(self, match):
        """
        Converts a single occurrence of a Python object representation of a defect table
        (e.g., 'Defect_table(id=0, defect_type="", defect_item="", value=[0, 0, ...])')
        into a valid JSON object string.
        """
        # Extract the entire matched text.
        text = match.group(0)
        # Remove the leading "Defect_table(" and trailing ")".
        inner = text[len("Defect_table(") : -1]
        # Replace keys written as key= with "key":
        # For example, convert: id=0  to  "id": 0
        inner = re.sub(r"(\w+)=", r'"\1": ', inner)
        # Return a JSON object string.
        return "{" + inner + "}"

    def extract_pchart_table(self, pchart_table_str):
        """
        Extracts a valid JSON object from the pchart_table string.

        This function:
          1. Replaces any Python-specific defect table representations (Defect_table(...))
             with valid JSON objects.
          2. Locates the last closing brace ('}') to help handle truncated JSON.
          3. Attempts to parse the cleaned JSON string.

        Returns a dictionary with the JSON data if successful, or an empty dict otherwise.
        """
        if not pchart_table_str or pchart_table_str.strip() == "":
            # print ( "Warning: pchart_table string is empty or None." )
            return {}

        # Replace all occurrences of Defect_table(...) with valid JSON object strings.
        cleaned_str = re.sub(
            r"Defect_table\([^)]*\)", self.convert_defect_table, pchart_table_str
        )

        # Trim whitespace.
        cleaned_str = cleaned_str.strip()

        # If the JSON appears to be truncated, try to use only the valid portion.
        # We do this by finding the last closing brace.
        last_brace_index = cleaned_str.rfind("}")
        if last_brace_index == -1:
            # print ( "Error: No closing brace found in pchart_table string." )
            return {}

        # Extract the substring up to (and including) the last '}'
        valid_json_str = cleaned_str[: last_brace_index + 1]

        try:
            data = json.loads(valid_json_str)
            return data
        except json.JSONDecodeError as e:
            # print ( f"Error parsing pchart_table JSON: {e}" )
            return {}

    def number_to_column_lower(self, n):
        """Convert a positive integer n to its corresponding Excel column string in lowercase."""
        result = ""
        while n > 0:
            n, remainder = divmod(n - 1, 26)
            result = chr(97 + remainder) + result  # Use 97 for 'a'
        return result

    # def extract_pchart_graph(self, pchart_graph_str):
    def extract_pchart_graph(self, pchart_graph_data):
        """
        Extracts and converts the pchart_graph JSON-like string into structured data.

        This updated function cleans the string by:
          - Converting custom objects (e.g., Defect_Graph(...)) into JSON objects.
          - Replacing Python's None with JSON null.
          - Removing trailing commas before closing brackets.

        Returns a dictionary with keys such as "defect_list", "x_axis_label", etc.
        """
        try:
            # *!
            # if not pchart_graph_str or pchart_graph_str.strip() == "":
            #     # print ( "Warning: pchart_graph_str is empty or None." )
            #     return {}

            # # Convert to valid JSON format using the custom conversion function.
            # pchart_graph_str = self.convert_to_json_compatible_format(pchart_graph_str)
            # # Replace Python's None with JSON null
            # pchart_graph_str = pchart_graph_str.replace("None", "null")
            # # Remove trailing commas before a closing brace or bracket.
            # pchart_graph_str = re.sub(r",\s*([\]}])", r"\1", pchart_graph_str)

            # # Parse the JSON data.
            # pchart_graph_data = json.loads(pchart_graph_str)
            # *!
            # Extract defect list, ensuring that only dictionaries are processed.
            defect_list = []
            if "defect" in pchart_graph_data:
                for defect in pchart_graph_data["defect"]:
                    if isinstance(defect, dict):
                        defect_list.append(
                            {
                                "id": defect.get("id", 0),
                                "defect_name": defect.get("defect_name", ""),
                                "value": defect.get("value", []),
                            }
                        )

            # Return the extracted data with proper type conversions.
            return {
                "defect_list": defect_list,
                "x_axis_label": pchart_graph_data.get("x_axis_label", []),
                "x_axis_value": list(
                    map(float, pchart_graph_data.get("x_axis_value", []))
                ),
                "x_axis_maxmin": list(
                    map(float, pchart_graph_data.get("x_axis_maxmin", []))
                ),
                "y_left_axis": list(map(int, pchart_graph_data.get("y_left_axis", []))),
                "y_right_axis": list(
                    map(float, pchart_graph_data.get("y_right_axis", []))
                ),
                "p_bar": (
                    list(map(float, pchart_graph_data.get("p_bar", [])))
                    if pchart_graph_data.get("p_bar") is not None
                    else []
                ),
                "percent_defect": list(
                    map(float, pchart_graph_data.get("percent_defect", []))
                ),
                "ucl_target": list(map(float, pchart_graph_data.get("ucl_target", []))),
            }

        except json.JSONDecodeError as e:
            # print ( f"Error parsing pchart_graph: {e}" )

            return {}
        except Exception as e:
            # print ( f"Unexpected error: {e}" )

            return {}
