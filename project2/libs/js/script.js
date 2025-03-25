
$(document).ready(function () {

  // Call functions to populate tables
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
  clearSearchInput();

  // Clear search input
  function clearSearchInput() {
    $("#searchInp").val("");
  }

  /*----------------------------------------*/
  /* Global variables */
  /*----------------------------------------*/

  // Clear Table  
  const clearTable = (tableType) => {
    if (tableType === "personnel") {
      $("#personnelTableBody").html(""); 
    }
    if (tableType === "departments") {
      $("#departmentTableBody").html("");
    }
    if (tableType === "locations") {
      $("#locationTableBody").html("");
    }
  };

  // <td> classes
  const tdClass = "align-middle text-nowrap d-none d-md-table-cell";
  const btnClass = "btn btn-primary btn-sm me-2 align-right";

  // <button> classes
  function createButton(id, buttonType, tableType = "Personnel") {
    
    const iconClass = buttonType === "edit" ? "fa-pencil" : "fa-trash";
    
    const modalTarget = `#${buttonType}${tableType}Modal`;
    
    return $("<button>", {
      type: "button",
      class: btnClass,
      "data-bs-toggle": "modal",
      "data-bs-target": modalTarget,
      "data-id": id
    }).append($("<i>", { class: `fa-solid ${iconClass} fa-fw` }));

  }

  // Current personnel id
  let currentPersonnelId
  let currentDepartmentId

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/

  // Get all personnel
  function getAllPersonnel () {
    
    $.ajax({
      url: "libs/php/getAllPersonnel.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("personnel");
          
          $.each(result.data, function () {
            
            $("#personnelTableBody").append(
              
              $("<tr>").append(
                
                $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                $("<td>", { text: this.jobTitle, class: tdClass }),

                $("<td>", { text: this.department, class: tdClass }),

                $("<td>", { text: this.location, class: tdClass }),

                $("<td>", { text: this.email, class: tdClass }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  // Get all departments
  function getAllDepartments () {
    
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("departments");
          
          $.each(result.data, function () {

            $("#departmentTableBody").append(

              $("<tr>").append(
                
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                $("<td>", { text: this.location, class: tdClass }),

                $("<td>" , { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  // Get all locations
  function getAllLocations () {
    
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("locations");
          
          $.each(result.data, function () {

            $("#locationTableBody").append(

              $("<tr>").append(
                
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  /*----------------------------------------*/
  /* DELETE FUNCTIONS */
  /*----------------------------------------*/

  // Delete personnel modal
  $("#deletePersonnelModal").on("show.bs.modal", function (e) {

    currentPersonnelId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },
      success: function (result) {

        if (result.status.code == 200) {

          $("#deletePersonnelName").html(
            `Are you sure you want to delete <strong>${result.data.personnel[0].firstName} ${result.data.personnel[0].lastName}</strong> from the database?`
          );
          
        } else {
          $("#deletePersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#deletePersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  }
  );

  // Delete personnel submit
  $("#deletePersonnelBtn").on("click", function () {
    
    $.ajax({
      url: "libs/php/deletePersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentPersonnelId
      },
      success: function (result) {
        
        if (result.status.code == 200) {
          getAllPersonnel();
          $("#deletePersonnelModal").modal("hide");
        }

      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  }
  );

  // Delete department modal
  $("#deleteDepartmentsModal").on("show.bs.modal", function (e) {
    
    currentDepartmentId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },
      success: function (result) {

        if (result.status.code == 200) {
          const departmentName = result.data[0].name;
          const personnelCount = parseInt(result.data[0].personnelCount);

          if (result.data && result.data.length > 0) {
            
            $("#deleteDepartmentsName").html(
              `You are unable to delete <strong>${departmentName}</strong> as <strong>${personnelCount} Personnel</strong> are assigned to this department.`
            );

            $("#deleteDepartmentsBtns").hide();

            $("#deleteDepartmentsCancelBtn").show();
                
          } else if (result.data && result.data.length === 0) {
            $("#deleteDepartmentsName").html(
              `Are you sure you want to delete <strong>${departmentName}</strong> from the database?`
            );
            
          } else {
            $("#deleteDepartmentsModal .modal-title").replaceWith(
              "Error retrieving data"
            );
          }
          
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#deleteDepartmentsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  }
  );

  // Delete department submit
  $("#deleteDepartmentsBtn").on("click", function () {
    
    $.ajax({
      url: "libs/php/deleteDepartmentByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentDepartmentId
      },
      success: function (result) {
        
        if (result.status.code == 200) {
          getAllDepartments();
          $("#deleteDepartmentsModal").modal("hide");
        }

      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  }
  );

  // Delete location modal
  $("#deleteLocationsModal").on("show.bs.modal", function (e) {
    
    currentLocationId = $(e.relatedTarget).attr("data-id");
    
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: currentLocationId
      },
      success: function (result) {

        if (result.status.code == 200) {
          
          $("#deleteLocationsName").html(
            `Are you sure you want to delete <strong>${result.data[0].name}</strong> from the database?`
          );
          
        } else {
          $("#deleteLocationsModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#deleteLocationsModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  }
  );



  /*----------------------------------------*/
  /* SEARCH FUNTCION */
  /*----------------------------------------*/

  $("#searchInp").on("keyup", function () {

    const searchInput = $(this).val();
    
    // Personel table
    if ($("#personnelBtn").hasClass("active")) {;
      
      $.ajax({
        url: "libs/php/searchAllPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("personnel");
            
            if(result.data && result.data.length > 0) {

              $.each(result.data, function () {
                
                $("#personnelTableBody").append(
                  
                  $("<tr>").append(
                    
                    $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                    $("<td>", { text: this.jobTitle, class: tdClass }),

                    $("<td>", { text: this.departmentName, class: tdClass }),

                    $("<td>", { text: this.locationName, class: tdClass }),

                    $("<td>", { text: this.email, class: tdClass }),

                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
                  )
                );
              });

            } else {
              
              $("#personnelTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            }
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    
    // Department table
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $.ajax({
        url: "libs/php/searchAllDepartments.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("departments");

            if(result.data && result.data.length > 0) {

              $.each(result.data, function () {

                $("#departmentTableBody").append(

                  $("<tr>").append(
                    
                    $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                    $("<td>", { text: this.locationName, class: tdClass }),

                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))
                  )
                );
              });

            } else {

              $("#departmentTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            }
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      });
    
    // Location table
    } else {
      
      $.ajax({
        url: "libs/php/searchAllLocations.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("locations");

            if(result.data && result.data.length > 0) {
            
              $.each(result.data, function () {

                $("#locationTableBody").append(

                  $("<tr>").append(
                    
                    $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
                  )
                );
              });

            } else {

              $("#locationTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            };
          };
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      });
    };
  });


  /*----------------------------------------*/
  /* BUTTON FUNCTIONS */
  /*----------------------------------------*/

  $("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      getAllPersonnel();
      clearSearchInput();

    } else if ($("#departmentsBtn").hasClass("active")) {
      // Refresh department table
      getAllDepartments();
      clearSearchInput();

    } else {
      // Refresh location table
      getAllLocations();
      clearSearchInput();

    }

  });

  $("#filterBtn").click(function () {
    
    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
    
  });

  $("#addBtn").click(function () {
    
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    getAllPersonnel();
    clearSearchInput();
  });
  
  $("#departmentsBtn").click(function () {
    // Call function to refresh department table
    getAllDepartments();
    clearSearchInput();
  });
  
  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    getAllLocations();
    clearSearchInput();
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    
    $.ajax({
      url:
        "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id") 
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted

          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

          $("#editPersonnelDepartment").html("");

          $.each(result.data.department, function () {
            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  // Executes when the form button with type="submit" is clicked

  $("#editPersonnelForm").on("submit", function (e) {
    
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data
    
  });

});