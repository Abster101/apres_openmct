export const activityTypes = {
    "$schema": "./configurationSchema.json",
    "description": "Configuration information for the Drill model",
    "modelConfig": [
        {
            "actProcType": "DrillAuger",
            "colorHex": "#00ff00",
            "timelineLegend": "Drill_System"
        },
        {
            "actProcType": "DrillUnStow",
            "colorHex": "#ff0000",
            "timelineLegend": "Drill_System"
        },
        {
            "actProcType": "DrillStow",
            "colorHex": "#0000ff",
            "timelineLegend": "Drill_System"
        },
        {
            "actProcType": "DrillCam_PwrOn",
            "colorHex": "#ffffff",
            "timelineLegend": "DrillCam_System"
        },
        {
            "actProcType": "DrillCam_PwrOff",
            "colorHex": "#000000",
            "timelineLegend": "DrillCam_System"
        },
        {
            "actProcType": "DrillCam_Operate",
            "colorHex": "#909090",
            "timelineLegend": "DrillCam_System"
        }
    ],
    "numericChronicleConfig": [
        {
            "varName": "BatteryCharge",
            "colorHex": "#009933"
        }
    ],
    "stateChronicleConfig": [
        {
            "varName": "Drill_sys",
            "stateColors": [
            {
                "stateVal": "idle",
                "colorHex": "#c0c0c0"
            },
            {
                "stateVal": "Auger",
                "colorHex": "#950000"
            }
            ]
        },
        {
            "varName": "DrillArm_sys",
            "stateColors": [
            {
                "stateVal": "stowed",
                "colorHex": "#4d2600",
                "textColorHex": "#ffffff"
            },
            {
                "stateVal": "Unstowing",
                "colorHex": "#ffbf80"
            },
            {
                "stateVal": "unstowed",
                "colorHex": "#ff8000"
            },
            {
                "stateVal": "Stowing",
                "colorHex": "#b35900",
                "textColorHex": "#ffffff"
            }
            ]
        },
        {
            "varName": "DrillCam_sys",
            "stateColors": [
            {
                "stateVal": "off",
                "colorHex": "#000000",
                "textColorHex": "#ffffff"
            },
            {
                "stateVal": "PwrOn",
                "colorHex": "#cccccc"
            },
            {
                "stateVal": "on",
                "colorHex": "#000000",
                "textColorHex": "#ffffff"
            },
            {
                "stateVal": "PwrOff",
                "colorHex": "#666666",
                "textColorHex": "#ffffff"
            }
        ]
      },
      {
        "varName": "Mobility_sys",
        "stateColors": [
          {
            "stateVal": "idle",
            "colorHex": "#c0c0c0"
          },
          {
            "stateVal": "Drive",
            "colorHex": "#0000ff",
            "textColorHex": "#ffffff"
          }
        ]
      }
    ]
}

  